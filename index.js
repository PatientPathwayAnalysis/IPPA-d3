var d3 = require('d3');
var toBlocks = require('./src/blocks.js').toBlocks;
var toPatFreq = require('./src/patFreq.js').toPatFreq;
var toStageDist = require('./src/stageDist.js').toStageDist;

d3.queue()
  .defer(d3.json, "https://patientpathwayanalysis.github.io/IPPA-data/output/Pathways.json")
  .defer(d3.json, "https://patientpathwayanalysis.github.io/IPPA-data/Input/Stages_TB.json")
  .await(function(error, pathways, stage_maps) {
    console.log(error);
    console.log(stage_maps);
    blocks = toBlocks(pathways, stage_maps);
    // console.log(blocks);
    patFreq = toPatFreq(blocks);
    // console.log(patFreq);
    stDist = toStageDist(blocks, stage_maps);
    console.log(stDist);
  });
