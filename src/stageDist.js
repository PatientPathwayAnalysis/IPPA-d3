export function toStageDist(blocks, stage_maps, end, dt) {
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
