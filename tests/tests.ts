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
    it('family3', () => {
        var h = new Household("a","c","z");
        h.addName("Joe", "Smith");
        h.addName("Mary", "Smith");
        h.addName("Paul", "Smith");
        assert.equal("Smith Household", h.getName());
    });

    // If inputs are caps, then "Household" tag should be caps. 
    it('family3Caps', () => {
        var h = new Household("a","c","z");
        h.addName("JOE", "SMITH");
        h.addName("MARY", "SMITH");
        h.addName("PAUL", "SMITH");
        assert.equal("SMITH HOUSEHOLD", h.getName());
    });

    it('different', () => {
        var h = new Household("a","c","z");
        h.addName("Joe", "Smith");
        h.addName("Mary", "Jane");
        assert.equal("Joe Smith & Mary Jane", h.getName());
    });

    it('different23', () => {
        var h = new Household("a","c","z");
        h.addName("Joe", "Jones");
        h.addName("Joe", "Smith");
        h.addName("Mary", "Smith");
        h.addName("Ted", "Teddy");
        assert.equal("Joe Jones & Smith Household & Ted Teddy", h.getName());
    });

    it('different2', () => {
        var h = new Household("a","c","z");
        h.addName("Joe", "Smith");
        h.addName("Mary", "Smith");
        h.addName("Ted", "Teddy");
        assert.equal("Smith Household & Ted Teddy", h.getName());
    });
    
    it('different24', () => {
        var h = new Household("a","c","z");
        h.addName("Joe", "Jones");
        h.addName("Joe", "Smith");
        h.addName("Mary", "Smith");
        h.addName("Ted", "Teddy");
        h.addName("Paul", "Teddy");
        assert.equal("Joe Jones & Smith Household & Teddy Household", h.getNameWorker()); // too long
    });

    it('too_long', () => {
        var h = new Household("a","c","z");
        h.addName("Jsssssssssssssssssssssssssssssssssssssoe", "Jones");
        assert.equal("Current Residents", h.getName()); // Too long
    });

    it('different3', () => {
        var h = new Household("a","c","z");
        h.addName("Joe", "Smith");
        h.addName("Mary", "Smith");
        h.addName("Ted", "Teddy");
        h.addName("Fred", "Teddy");
        assert.equal("Smith & Teddy Households", h.getName());
    });

    // Interleave order and makre sure we get same result. 
    it('different3order', () => {
        var h = new Household("a","c","z");
        h.addName("Joe", "Smith");        
        h.addName("Ted", "Teddy");
        h.addName("Mary", "Smith");
        h.addName("Fred", "Teddy");
        assert.equal("Smith & Teddy Households", h.getName());
    });

    it('different4', () => {
        var h = new Household("a","c","z");
        h.addName("Joe", "Smith");
        h.addName("John", "Smith");
        h.addName("Mary", "Smith");
        h.addName("Ted", "Teddy");
        h.addName("Fred", "Teddy");
        h.addName("Fred", "Jones");
        h.addName("Ted", "Jones");
        assert.equal("Smith & Teddy & Jones Households", h.getName());
    });
});

