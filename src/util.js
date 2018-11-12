'use strict';

module.exports = {
    getAllMatches: function getAllMatches(string, regex) {
        const matches = [];
        let match = regex.exec(string);
        while (match) {
            const allmatches = [];
            const len = match.length;
            for (let index = 0; index < len; index++) {
                allmatches.push(match[index]);
            }
            matches.push(allmatches);
            match = regex.exec(string);
        }
        return matches;
    },

    isExist: function isExist(v) {
        return typeof v !== "undefined";
    },

    isEmptyObject: function isEmptyObject(obj) {
        return Object.keys(obj).length === 0;
    },

    merge: function merge(target, a) {
        if (a) {
            const keys = Object.keys(a);
            const len = keys.length;
            for (let i = 0; i < len; i++) {
                target[keys[i]] = a[keys[i]];
            }
        }
    },

    getValue: function getValue(v) {
        if (this.isExist(v)) {
            return v;
        } else {
            return "";
        }
    },

    buildOptions: function buildOptions(options, defaultOptions, props) {
        let newOptions = {};
        if (!options) {
            return defaultOptions; //if there are not options
        }

        for (let i = 0; i < props.length; i++) {
            if ( options[props[i]] !== undefined) {
                newOptions[props[i]] = options[props[i]];
            } else {
                newOptions[props[i]] = defaultOptions[props[i]];
            }
        }
        return newOptions;
    }
};