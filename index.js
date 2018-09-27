var d3 = require('d3');
var toBlocks = require('./src/blocks.js').toBlocks;
var toPatFreq = require('./src/patFreq.js').toPatFreq;
var toStageDist = require('./src/stageDist.js').toStageDist;

StageMaps = [

    {Stage: '_1', StageShow: '_', Colour:'_'},
    {Stage: '_2', StageShow: '_', Colour:'_'},
    {Stage: 'WAITING', StageShow: 'Waiting', Colour:'#FFFFA6', ColourShow: '#FFFFA6', Before: true},
    {Stage: '_4', StageShow: '_', Colour:'_'},

    {Stage: 'EVALUATING_L', StageShow: 'Evaluating', Colour:' #E6E961', ColourShow: '#E6E961', Before: true},
    {Stage: 'EVALUATING_H', StageShow: 'Detecting', Colour:'#9A9C34', ColourShow: '#525414', Before: true},
    {Stage: 'EVALUATING_E', StageShow: 'Detecting', Colour:'#525414', ColourShow: '#525414', Before: true},
    {Stage: 'NOT_TB', StageShow: 'Interrupted Evaluation', Colour:' #303030', ColourShow: '#303030', Before: true},

    {Stage: 'TREATING_F', StageShow: 'Treating 1st', Colour:' #4BB35D', ColourShow: '#4BB35D', Before: true},
    {Stage: 'FAIL', StageShow: 'Interrupted treatment', Colour:'#541814', ColourShow: '#541814', Before: false},
    {Stage: 'TREATING_S', StageShow: 'Treating 2nd', Colour:'#287836', ColourShow: '#4BB35D', Before: true},
    {Stage: '_16', StageShow: '_', Colour:'_'},

    {Stage: 'REEVALUATING_L', StageShow: 'Re-evaluating', Colour:'#80469C', ColourShow: '#80469C', Before: true},
    {Stage: 'REEVALUATING_H', StageShow: 'Re-detecting', Colour:'#532669', ColourShow: '#2B0F38', Before: true},
    {Stage: 'REEVALUATING_E', StageShow: 'Re-detecting', Colour:'#2B0F38', ColourShow: '#2B0F38', Before: true},
    {Stage: '_12', StageShow: '_', Colour:'_'},

    {Stage: 'DEAD', StageShow: 'Dead', Colour:' #000000', ColourShow: '#000000'},
    {Stage: 'CENSORED', StageShow: 'Censored', Colour:' #001804', ColourShow: '#001804'},
    {Stage: 'COMPLETED', StageShow: 'Completed', Colour:' #8EE09C', ColourShow: '#8EE09C'},
    {Stage: 'LOSS', StageShow:'Lost to follow-up', Colour:' #0F3115', ColourShow: '#0F3115'},
];


d3.json("https://patientpathwayanalysis.github.io/IPPA-data/output/Pathways.json", function(error, pathways) {
  blocks = toBlocks(pathways, StageMaps);
  console.log(blocks);
  patFreq = toPatFreq(blocks);
  console.log(patFreq);
  //stDist = toStageDist(blocks);
  //console.log(stDist);
})
