module.exports = {
    attributeNamePrefix: "@_",
    attrNodeName: false,
    textNodeName: "#text",
    ignoreAttributes: true,
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: false,
    arrayMode: false,
    trimValues: true,
    cdataTagName: false,
    cdataPositionChar: "\\c",
    localeRange: "",
    tagValueProcessor: function(a) {return a},
    attrValueProcessor: function(a) {return a}
};
