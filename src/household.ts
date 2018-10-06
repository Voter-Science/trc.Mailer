import * as bcl from 'trc-analyze/collections'

// Friendly merge names.
// IF they get too long, use "{LName} Household"
export class Household
{
    public constructor(address : string, city : string, zip : string) {
        this._address = address;
        this._city = city;
        this._zip = zip;
        this._firsts = [];
        this._lasts = [];
    }
    public addName(first : string, last : string) {
        this._firsts.push(first);
        this._lasts.push(last);
    }

    private _firsts : string[];
    private _lasts : string[];

    public _address : string;
    public _city : string;
    public _zip : string;

    // "Joe Smith" --> "Joe Smith"
    // "Joe Smith" + "Sue Smith" --> "Joe & Sue Smith"
    // "Joe Smith" + "Sue Jones" --> "Joe Smith & Sue Jones"
    public getName() : string 
    {
        var x = this.getNameWorker();

        // If names are too long, just give up. 
        if (x.length > 40) {
            // https://pe.usps.com/text/pub28/28c3_015.htm
            return "Current Residents";
        }
        return x;
    }
    public getNameWorker() : string 
    {
        if (this._firsts.length == 0)
        {
            return "";
        }
        if (this._firsts.length == 1) 
        {
            return this._firsts[0] + " " + this._lasts[0];
        }

        var Household = "Household";
        var Households = "Households";
        if (this._firsts[0] == this._firsts[0].toUpperCase()) {
            Household = "HOUSEHOLD";
            Households = "HOUSEHOLDS";
        }

        // If all lasts are the same. 
        var same = true;
        var last1 = this._lasts[0];        
        for(var last of this._lasts) 
        {
            if (last != last1) 
            {
                same =false;
                break;
            }
        }

        if (same == true) 
        {
            // Keep it brief. 
            if (this._firsts.length > 2) {
                return last1 + " " + Household;
            }

            return this._firsts.join(" & ") + " " + last1;
        }

        // Different last names
        var groups = new bcl.Dict<string[]>();
                
        for(var i in this._lasts) {
            var first = this._firsts[i];
            var last = this._lasts[i];

            var firsts : string[] = groups.get(last);
            if (!firsts) {
                firsts = [];
                groups.add(last, firsts);
            }
            firsts.push(first);
        }
       

        var onlyHouseholds = true;
        var name = "";
        var name2 = ""; // last names 
        groups.forEach((last, firsts) => {
            if (name.length > 0) {
                name += " & ";
            }
            if (firsts.length > 1) {
                if (name2.length > 0) {
                    name2 += " & ";
                }
                name2 += last;
                name += last + " " + Household;
            }
            else {
                onlyHouseholds = false;
                name += firsts[0] + " " + last;
            }
        });

        // If they're all households, then truncate it. 
        // "A Household & B Household" --> "A & B Households";
        if (onlyHouseholds) {
            name = name2 + " " + Households;
        }

        return name;
    }
}
