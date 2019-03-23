var vis = (function (exports) {
    'use strict';

    function toBlocks(pathways, stage_maps) {
        const StageSim = {};

        stage_maps.forEach(function (d) {
            StageSim[d.StageCode] = d;
        });

        return pathways
        .map(pw => pw.Pathway)
        .map(pp => {
            let confirmed = false;
            pp = pp.map(function (evt) {
                evt = Object.assign({}, evt);
                const sel = StageSim[evt.Stage];

                evt.Colour = sel.Colour;
                if (confirmed) {
                    evt.PreTre = false;
                    evt.PostTre = true;
                } else if (sel.PreTre) {
                    if (sel.PostTre) {
                        confirmed = true;
                        evt.PostTre = true;
                        evt.PreTre = true;
                    } else {
                        evt.PreTre = true;
                        evt.PostTre = false;
                    }
                } else {
                    evt.PreTre = false;
                    evt.PostTre = true;
                }
                evt.Stage = sel.Stage;
                return evt;
            });

            let evt0 = pp[0], evt1, reduced = [evt0];

            for (let i = 1; i < pp.length; i++) {
                evt1 = pp[i];
                if (evt1.Stage !== evt0.Stage) {
                    evt0 = evt1;
                    reduced.push(evt0);
                }
            }
            return reduced;
        })
        .map((pp, j) => {
            const t0 = pp[0].Time, n_stage = pp.length;
            const preTre = pp.filter(evt => evt.PreTre);
            const postTre = pp.filter(evt => evt.PostTre);

            let bks = [];
            let evt0 = pp[0], evt1;
            for (let i = 1; i < n_stage; i++) {
                evt1 = pp[i];

                bks.push({
                    Index: j,
                    Stage: evt0.Stage,
                    Next: evt1.Stage,
                    Colour: evt0.Colour,
                    PreTre: evt0.PreTre,
                    PostTre: evt0.PostTre,
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
                T1: Infinity,
                t0: evt0.Time - t0,
                t1: Infinity,
                dt: 1
            });

            return {
                Pattern: pp.map(p => p.Stage).join(":"),
                Num: bks.length,
                PreTrePattern: preTre.map(p => p.Stage).join(":"),
                PostTrePattern: postTre.map(p => p.Stage).join(":"),
                NumPreTre: preTre.length,
                NumPostTre: postTre.length,
                Blocks: bks
            }
        });
    }

    function filterPrePat(blocks) {
        return blocks.map(pp => {
            const n = pp.NumPreTre;
            return {
                Pattern: pp.PreTrePattern,
                Num: n,
                Blocks: pp.Blocks.filter((blk, i) => i < n)
            };
        })
    }

    function filterPostPat(blocks) {
        return blocks.map(pp => {
            const n_all = pp.Blocks.length;
            const n = pp.NumPostTre;
            return {
                Pattern: pp.PostTrePattern,
                Num: n,
                Blocks: pp.Blocks.filter((blk, i) => i >= (n_all - n))
            };
        })
    }

    function toPatFreq(blocks) {

        let PatternGroups = d3.nest()
        .key(sf => sf.Pattern)
        .entries(blocks)
        .sort((a, b) => a.values.length - b.values.length);

        let y0 = 0;
        //console.log(PatternGroups);
        return PatternGroups
        .map(kv => {
            kv.values.forEach(sf => {
                // Cumulative heights of blocks
                sf.y0 = y0;
                y0++;
            });
            return kv;
        })
        .map(kv => {
            const size = kv.values[0].Num, n = kv.values.length;
            let sf = [], s_dt = 0, y0 = kv.values[0].y0, x0 = 0;
            for (let i = 0; i < size; i++) {
                let sts = kv.values.map(v => v.Blocks[i]);
                let dt = d3.sum(sts.map(v => v.dt));

                sf.push({
                    Stage: sts[0].Stage,
                    Colour: sts[0].Colour,
                    dt: dt,
                    x0_e: x0 / n,
                    dx_e: dt / n,
                    y0: y0,
                    dy: n
                });
                if (i < size - 1) {
                    s_dt += dt;
                }
                x0 += dt;
            }
            s_dt = s_dt/n;

            sf.forEach(s => s.dx_s = s.dx_e / s_dt);
            sf.forEach(s => s.x0_s = s.x0_e / s_dt);
            sf[sf.length - 1].dx_e = 1;
            if (s_dt === 0) sf[sf.length - 1].x0_e = 0;
            sf[sf.length - 1].x0_s = 1;
            sf[sf.length - 1].dx_s = 0.02;
            return sf
        })
        .reduce((c, a) => c.concat(a), []);
    }

    function toStageDist(blocks, stage_maps, end, dt) {
        end = end || 365;
        dt = dt || 5;

        const stage_counter = {};
        stage_maps.forEach(function (d) {
            stage_counter[d.Stage] = 0;
        });

        blocks = blocks.map(blk => {
            blk = Object.assign({}, blk);
            blk.at = function (t) {
                let sel;
                for (let i = 0; i < this.Blocks.length; i++) {
                    sel = this.Blocks[i];
                    if (sel.t1 >= t && sel.t0 <= t) {
                        return sel.Stage;
                    }
                }
                return sel.Stage;
            };
            return blk;
        });

        let sds = [], counts;

        for (let day = 0; day <= end; day += dt) {
            counts = Object.assign({}, stage_counter);
            blocks.forEach(blk => counts[blk.at(day)] += 1);
            sds.push(counts);
        }
        let reversed_sm = stage_maps
        .map(s=>s.Stage)
        .filter((v, i, a) => a.indexOf(v) === i)
        .reverse();
        
        let colours = {};
        stage_maps.forEach(e => colours[e.Stage] = e.Colour);

        return sds.map((sd, t) => {
            //let y0 = d3.sum(Object.values(sd));
            let y0 = 0;

            return reversed_sm
            .filter(st => sd[st] > 0)
            .map(st => {
                let dy = sd[st];

                let res = {
                    Stage: st,
                    x0: t * dt,
                    dx: dt,
                    y0: y0,
                    dy: dy,
                    Colour: colours[st]
                };
                y0 += dy;
                return res;
            });
        })
        .reduce((c, a) => c.concat(a), []);
    }

    exports.toBlocks = toBlocks;
    exports.toPatFreq = toPatFreq;
    exports.filterPostPat = filterPostPat;
    exports.filterPrePat = filterPrePat;
    exports.toStageDist = toStageDist;

    return exports;

}({}));
