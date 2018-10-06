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
        if (this._firsts.length == 0)
        {
            return "";
        }
        if (this._firsts.length == 1) 
        {
            return this._firsts[0] + " " + this._lasts[0];
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
            return this._firsts.join(" & ") + " " + last1;
        }

        // Differents
        var name = "";
        for(var i in this._lasts) {
            if (name.length > 0) {
                name += " & ";
            }
            name += this._firsts[i] + " " + this._lasts[i];
        }
        return name;
    }
}
