'use strict';

const nodeToJson = require("./node2Json");
const defaultOptions = require('./defaultOptions')
const xmlToNodeobj = require("./xmlstr2node");
const buildOptions = require("./util").buildOptions;

module.exports.parse = function (xmlData, options) {
    options = buildOptions(options, defaultOptions, xmlToNodeobj.props);
    return nodeToJson.convertToJson(xmlToNodeobj.getTraversalObj(xmlData, options), options);
};