var d3 = require('d3');
var vis = require('./build/ippa-vis.js');

d3.queue()
  .defer(d3.json, "https://patientpathwayanalysis.github.io/IPPA-data/output/Pathways.json")
  .defer(d3.json, "https://patientpathwayanalysis.github.io/IPPA-data/Input/Stages_TB.json")
  .await(function(error, pathways, stage_maps) {
    console.log(error);
    console.log(stage_maps);
    blocks = vis.toBlocks(pathways, stage_maps);
    // console.log(blocks);
    patFreq = vis.toPatFreq(blocks);
    // console.log(patFreq);
    stDist = vis.toStageDist(blocks, stage_maps);
    console.log(stDist);
  });
