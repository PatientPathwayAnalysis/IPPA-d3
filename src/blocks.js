var d3 = require('d3');

function toBlocks(pathways, stage_maps) {
  const StageSim = {}

  stage_maps.forEach(function(d) {
    StageSim[d.Stage] = d;
  })

  return pathways
    .map(pw => pw.Pathway)
    .map(pp => {
      pp = pp.map(function(evt) {
        evt = Object.assign({}, evt);
        const sel = StageSim[evt.Stage];
        evt.Stage = sel.StageShow;
        evt.Colour = sel.ColourShow;
        evt.PreTre = sel.PreTre;
        return evt;
      });

      let evt0 = pp[0], evt1, reduced = [evt0];

      for(let i = 1; i < pp.length; i++) {
        evt1 = pp[i];
        if (evt1.Stage != evt0.Stage) {
          evt0 = evt1;
          reduced.push(evt0);
        }
      }
      return reduced;
    })
    .map((pp, j) => {
      const t0 = pp[0].Time, n_stage = pp.length;
      const preTre = pp.filter(evt => evt.PreTre), n_preTre = preTre.length;

      let bks = [];
      let evt0=pp[0], evt1, evt;
      for(let i = 1; i < n_stage; i++) {
        evt1 = pp[i];

        bks.push({
          Index: j,
          Stage: evt0.Stage,
          Next: evt1.Stage,
          Colour: evt0.Colour,
          PreTre: evt0.PreTre,
          T0: evt0.Time,
          T1: evt1.Time,
          t0: evt0.Time - t0,
          t1: evt1.Time - t0,
          dt: evt1.Time - evt0.Time
        });
        evt0 = evt1;
      }

      bks.push({
        Index: j,
        Stage: evt0.Stage,
        Colour: evt0.Colour,
        PreTre: evt0.PreTre,
        T0: evt0.Time,
        t0: evt0.Time - t0,
        dt: 1
      });

      return {
        Pattern: pp.map(p => p.Stage).join(":"),
        PreTrePattern: preTre.map(p => p.Stage).join(":"),
        Blocks: bks
      }
    });
}

module.exports = {
  toBlocks: toBlocks
}
