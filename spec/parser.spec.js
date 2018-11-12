"use strict";

const parser = require("../src/parser");

describe("XMLParser", function() {

    it("should parse xml strings", function() {
        const xmlData = `
            <results>
            <one>string1</one>
            <two>string2</two>
            <three>string4</three>
            </results>
        `;
        const expected = {
            "results": {
                "one": "string1",
                "two": "string2",
                "three": 'string4'
            }
        };

        const result = parser.parse(xmlData);
        expect(result).toEqual(expected);
    });

    it("should parse xml ints including floats", function() {
        const xmlData = `
            <results>
            <value>100</value>
            <float>100.50</float>
            </results>
        `;
        const expected = {
            "results": {
                "value": 100,
                "float": 100.50
            }
        };

        const result = parser.parse(xmlData);
        expect(result).toEqual(expected);
    });

    it("should parse xml booleans", function() {
        const xmlData = `
            <results>
            <boolean>true</boolean>
            </results>
        `;
        const expected = {
            "results": {
                "boolean": true
            }
        };

        const result = parser.parse(xmlData);
        expect(result).toEqual(expected);
    });
});
