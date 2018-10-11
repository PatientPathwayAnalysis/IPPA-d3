export function toStageDist(blocks, stage_maps, end, dt) {
  end = end || 365;
  dt = dt || 5;

  const stage_counter = {};
  stage_maps.forEach(function(d) {
    stage_counter[d.StageShow] = 0;
  })

  blocks = blocks.map(blk => {
    blk = Object.assign({}, blk);
    blk.at = function(t) {
      let sel;
      for (var i = 0; i < this.Blocks.length; i++) {
        sel = this.Blocks[i];
        if (sel.t0 >= t & sel.t1 < t) break;
      }
      return sel.Stage;
    }
    return blk;
  })

  let sds = [], counts;

  for (var day = 0; day <= end; day+=dt) {
    counts = Object.assign({}, stage_counter);
    blocks.forEach(blk => counts[blk.at(day)] += 1);
    sds.push(counts);
  }

  return sds.map((sd, t) => {
    let y0 = 0;
    return stage_maps
      .filter(st => sd[st.StageShow] > 0)
      .map(st => {
        let res = {
          x0: t*dt,
          dx: dt,
          y0: y0,
          dy: sd[st.StageShow],
          Colour: st.Colour
        };
        y0 += res.dy;

        return res;
      });
  })
  .reduce((c, a) => c.concat(a), []);
}
