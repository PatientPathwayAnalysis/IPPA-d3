var d3 = require('d3');

export function toPatFreq(blocks) {

  let PatternGroups = d3.nest()
      .key(sf => sf.PreTrePattern)
      .entries(blocks)
      .sort((a, b) => a.values.length - b.values.length);


  let y0 = 0;
  let sfsBlocks = PatternGroups
      .map(kv => {
          kv.values.forEach(sf => {
              sf.y0 = y0;
              y0 ++;
          });
          return kv;
      })
      .map(kv => {
          const size = kv.values[0].Blocks.length, n=kv.values.length;
          let sf = [], s_dt = 0, y0=kv.values[0].y0, x0=0;
          for (let i = 0; i < size; i++) {
              let sts = kv.values.map(v => v.Blocks[i]);
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
    return sfsBlocks;
}
