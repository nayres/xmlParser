'use strict'; 

const util = require('./util');
const isExist = require('./util').isExist;
const xmlNode = require("./xmlNode");
const defaultOptions = require('./defaultOptions');
const attrsRegx = new RegExp("([^\\s=]+)\\s*(=\\s*(['\"])(.*?)\\3)?", "g");

const TagType = {"OPENING": 1, "CLOSING": 2, "SELF": 3, "CDATA": 4};
const props = [
    "attributeNamePrefix", 
    "attrNodeName", 
    "textNodeName", 
    "ignoreAttributes", 
    "ignoreNameSpace", 
    "allowBooleanAttributes", 
    "parseNodeValue", 
    "parseAttributeValue", 
    "arrayMode", 
    "trimValues", 
    "cdataTagName", 
    "cdataPositionChar", 
    "localeRange", 
    "tagValueProcessor", 
    "attrValueProcessor", 
    "parseTrueNumberOnly"
];
exports.props = props;

module.exports = {
    getTraversalObj: function getTraversalObj(xmlData, options) {
        let regx = "<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|(([\\w:\\-._]*:)?([\\w:\\-._]+))([^>]*)>|((\\/)(([\\w:\\-._]*:)?([\\w:\\-._]+))\\s*>))([^<]*)";
        
        options = util.buildOptions(options, defaultOptions, props);
        xmlData = xmlData.replace(/<!--[\s\S]*?-->/g, "");
    
        const xmlObj = new xmlNode("!xml");
        let currentNode = xmlObj;
    
        regx = regx.replace(/\[\\w/g, "[" + options.localeRange + "\\w");
        const tagsRegx = new RegExp(regx, "g");
        let tag = tagsRegx.exec(xmlData);
        let nextTag = tagsRegx.exec(xmlData);
        while (tag) {
            const tagType = this.checkForTagType(tag);
            if (tagType === TagType.CLOSING) {
                if (currentNode.parent && tag[14]) {
                    currentNode.parent.val = util.getValue(currentNode.parent.val) + "" + this.processTagValue(tag[14], options);
                }
    
                currentNode = currentNode.parent;
            } else if (tagType === TagType.CDATA) {
                if (options.cdataTagName) {
                    const childNode = new xmlNode(options.cdataTagName, currentNode, tag[3]);
                    childNode.attrsMap = this.buildAttributesMap(tag[8], options);
                    currentNode.addChild(childNode);
                    currentNode.val = util.getValue(currentNode.val) + options.cdataPositionChar;
                    if (tag[14]) {
                        currentNode.val += this.processTagValue(tag[14], options);
                    }
                } else {
                    currentNode.val = (currentNode.val || "") + (tag[3] || "") + this.processTagValue(tag[14], options);
                }
            } else if (tagType === TagType.SELF) {
                if (currentNode && tag[14]) {
                    currentNode.val = util.getValue(currentNode.val) + "" + this.processTagValue(tag[14], options);
                }
    
                const childNode = new xmlNode(options.ignoreNameSpace ? tag[7] : tag[5], currentNode, "");
                if (tag[8] && tag[8].length > 1) {
                    tag[8] = tag[8].substr(0, tag[8].length - 1);
                }
                childNode.attrsMap = this.buildAttributesMap(tag[8], options);
                currentNode.addChild(childNode);
            } else {
                const childNode = new xmlNode(options.ignoreNameSpace ? tag[7] : tag[5], currentNode, this.processTagValue(tag[14], options));
                childNode.attrsMap = this.buildAttributesMap(tag[8], options);
                currentNode.addChild(childNode);
                currentNode = childNode;
            }
    
            tag = nextTag;
            nextTag = tagsRegx.exec(xmlData);
        }
    
        return xmlObj;
    },

    processTagValue: function processTagValue(val, options) {
        if (val) {
            if (options.trimValues) {
                val = val.trim();
            }
            val = options.tagValueProcessor(val);
            val = this.parseValue(val, options.parseNodeValue, options.parseTrueNumberOnly);
        }
        return val;
    },

    checkForTagType: function checkForTagType(match) {
        if (match[4] === "]]>") {
            return TagType.CDATA;
        } else if (match[10] === "/") {
            return TagType.CLOSING;
        } else if (typeof match[8] !== "undefined" && match[8].substr(match[8].length - 1) === "/") {
            return TagType.SELF;
        } else {
            return TagType.OPENING;
        }
    },

    resolveNameSpace: function resolveNameSpace(tagname, options) {
        if (options.ignoreNameSpace) {
            const tags = tagname.split(":");
            const prefix = tagname.charAt(0) === "/" ? "/" : "";
            if (tags[0] === "xmlns") {
                return "";
            }
            if (tags.length === 2) {
                tagname = prefix + tags[1];
            }
        }
        return tagname;
    },

    parseValue: function parseValue(val, shouldParse, parseTrueNumberOnly) {
        if (shouldParse && typeof val === "string") {
            let parsed;
            if (val.trim() === "" || isNaN(val)) {
                parsed = val === "true" ? true : val === "false" ? false : val;
            } else {
                if(val.indexOf("0x") !== -1){//support hexa decimal
                    parsed = Number.parseInt(val,16);
                } else if (val.indexOf(".") !== -1) {
                    parsed = Number.parseFloat(val);
                } else {
                    parsed = Number.parseInt(val, 10);
                }
                if(parseTrueNumberOnly){
                    parsed = String(parsed) === val ? parsed : val;
                    
                }
            }
            return parsed;
        } else {
            if (this.isExist(val)) {
                return val;
            } else {
                return "";
            }
        }
    },
    
    buildAttributesMap: function buildAttributesMap(attrStr, options) {
        if (!options.ignoreAttributes && typeof attrStr === "string") {
            attrStr = attrStr.replace(/\r?\n/g, " ");
    
            const matches = util.getAllMatches(attrStr, attrsRegx);
            const len = matches.length;
            const attrs = {};
            for (let i = 0; i < len; i++) {
                const attrName = resolveNameSpace(matches[i][1], options);
                if (attrName.length) {
                    if (matches[i][4] !== undefined) {
                        if (options.trimValues) {
                            matches[i][4] = matches[i][4].trim();
                        }
                        matches[i][4] = options.attrValueProcessor(matches[i][4]);
                        attrs[options.attributeNamePrefix + attrName] = this.parseValue(matches[i][4], options.parseAttributeValue, options.parseTrueNumberOnly);
                    } else if (options.allowBooleanAttributes) {
                        attrs[options.attributeNamePrefix + attrName] = true;
                    }
    
                }
            }
            if (!Object.keys(attrs).length) {
                return;
            }
            if (options.attrNodeName) {
                const attrCollection = {};
                attrCollection[options.attrNodeName] = attrs;
                return attrCollection;
            }
            return attrs;
        }
    }

};