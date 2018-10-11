'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var d3 = require('d3');

function toBlocks(pathways, stage_maps) {
  const StageSim = {};

  stage_maps.forEach(function(d) {
    StageSim[d.Stage] = d;
  });

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
      let evt0=pp[0], evt1;
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

var d3$1 = require('d3');

function toPatFreq(blocks) {

  let PatternGroups = d3$1.nest()
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
              let dt = d3$1.sum(sts.map(v => v.dt));

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

var d3$2 = require('d3');

function toStageDist(blocks, stage_maps, end, dt) {
  end = end || 365;
  dt = dt || 5;

  const stage_counter = {};
  stage_maps.forEach(function(d) {
    stage_counter[d.StageShow] = 0;
  });

  blocks = blocks.map(blk => {
    blk = Object.assign({}, blk);
    blk.at = function(t) {
      let sel;
      for (var i = 0; i < this.Blocks.length; i++) {
        sel = this.Blocks[i];
        if (sel.t0 >= t & sel.t1 < t) break;
      }
      return sel.Stage;
    };
    return blk;
  });

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
        console.log(res);
        return res;
      });
  })
  .reduce((c, a) => c.concat(a), []);
}

exports.toBlocks = toBlocks;
exports.toPatFreq = toPatFreq;
exports.toStageDist = toStageDist;
