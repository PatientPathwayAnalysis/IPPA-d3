export function toBlocks(pathways, stage_maps) {
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
