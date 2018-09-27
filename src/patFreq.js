var d3 = require('d3');

function toSeqFreq(pathways) {
  let Patterns = pathways.map(function(pathway, j) {
      const t0 = pathway[0].Time;
      pathway = pathway.filter(evt => evt.Before);

      if (pathway.length === 1) {
        let p = pathway[0];
        return {
          Pattern: p.Stage,
          SF: [{Index: j, Stage: p.Stage, Colour: p.Colour, Time: 0, dt: 1}]
        }
      } else {
        return {
          Pattern: pathway.map(p => p.Stage).join(":"),
          SF: pathway.map((p, i) => {
              let dt = (pathway[i+1])? (pathway[i+1].Time - p.Time):1;
              return {Index: j, Stage: p.Stage, Colour: p.Colour, Time: p.Time-t0, dt: dt}
          })
        };
      }

  })

  let PatternGroups = d3.nest()
      .key(sf => sf.Pattern)
      .entries(Patterns)
      .sort((a, b) => a.values.length - b.values.length);

  // console.log(seqFreqSummary);
  y0 = 0;
  let sfsBlocks = PatternGroups
      .map(kv => {
          kv.values.forEach(sf => {
              sf.y0 = y0;
              y0 ++;
          });
          return kv;
      })
      .map(kv => {
          const size = kv.values[0].SF.length, n=kv.values.length;
          let sf = [], s_dt = 0, y0=kv.values[0].y0, x0=0;
          for (let i = 0; i < size; i++) {
              let sts = kv.values.map(v => v.SF[i]);
              let dt = d3.sum(sts.map(v => v.dt));

              sf.push({
                  Stage: sts[0].Stage,
                  dt: dt/n,
                  x0_e: x0/n,
                  dx_e: dt/n,
                  y0: y0,
                  dy: n
              });
              if (i < size - 1) {
                  s_dt += dt;
              }
              x0 += dt;
          }
          s_dt /= n;
          sf[sf.length-1].dx_e = 0.02 * s_dt;
          sf.forEach(s => s.dx_s = s.dx_e/s_dt);
          sf.forEach(s => s.x0_s = s.x0_e/s_dt);
          return sf;
      })
      .reduce((c, a) => c.concat(a), []);
    return sfsBlocks
}

module.exports = {
  toSeqFreq: toSeqFreq
}
