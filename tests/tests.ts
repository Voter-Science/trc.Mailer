// Example of some tests for a plugin.

// require() won't import any type information. So we need to explicitly declare types from require()
declare var require: any; // Needed so TS won't complain about require();
declare var describe: any;
declare var it: any;
var assert = require('chai').assert;

// normal TypeScript imports. This compiles down to require(), but also imports type information.
import { Household } from '../src/household'

// Run tests 
describe('sample test', () => {
    it('single', () => {
        var h = new Household("a","c","z");
        h.addName("Joe", "Smith");
        assert.equal("Joe Smith", h.getName());
    });
    it('family', () => {
        var h = new Household("a","c","z");
        h.addName("Joe", "Smith");
        h.addName("Mary", "Smith");
        assert.equal("Joe & Mary Smith", h.getName());
    });
    it('different', () => {
        var h = new Household("a","c","z");
        h.addName("Joe", "Smith");
        h.addName("Mary", "Jane");
        assert.equal("Joe Smith & Mary Jane", h.getName());
    });
});

