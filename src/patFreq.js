export function filterPrePat(blocks) {
    return blocks.map(pp => {
        const n = pp.NumPreTre;
        return {
            Pattern: pp.PreTrePattern,
            Num: n,
            Blocks: pp.Blocks.filter((blk, i) => i < n)
        };
    })
}

export function filterPostPat(blocks) {
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

export function toPatFreq(blocks) {

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
