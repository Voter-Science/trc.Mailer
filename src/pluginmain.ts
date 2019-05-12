// Sample 'Hello World' Plugin template.
// Demonstrates:
// - typescript
// - using trc npm modules and browserify
// - uses promises. 
// - basic scaffolding for error reporting. 
// This calls TRC APIs and binds to specific HTML elements from the page.  

import * as XC from 'trc-httpshim/xclient'
import * as common from 'trc-httpshim/common'

import * as core from 'trc-core/core'

import * as trcSheet from 'trc-sheet/sheet'
import * as trcSheetEx from 'trc-sheet/sheetEx'
import { ISheetContents, ColumnNames, SheetContents } from 'trc-sheet/sheetContents'

import * as plugin from 'trc-web/plugin'
import * as trchtml from 'trc-web/html'

import * as bcl from 'trc-analyze/collections'
import * as hh from 'trc-analyze/household'
import { Household } from './household'


// Installed via:
//   npm install --save-dev @types/jquery
// requires tsconfig: "allowSyntheticDefaultImports" : true 
declare var $: JQueryStatic;

// Provide easy error handle for reporting errors from promises.  Usage:
//   p.catch(showError);
declare var showError: (error: any) => void; // error handler defined in index.html

export class MyPlugin {
    private _sheet: trcSheet.SheetClient;
    private _pluginClient: plugin.PluginClient;

    public static BrowserEntryAsync(
        auth: plugin.IStart,
        opts: plugin.IPluginOptions
    ): Promise<MyPlugin> {

        var pluginClient = new plugin.PluginClient(auth, opts);

        // Do any IO here...

        var throwError = false; // $$$ remove this

        var plugin2 = new MyPlugin(pluginClient);
        return plugin2.InitAsync().then(() => {
            if (throwError) {
                throw "some error";
            }

            return plugin2;
        });
    }

    // Expose constructor directly for tests. They can pass in mock versions. 
    public constructor(p: plugin.PluginClient) {
        this._sheet = new trcSheet.SheetClient(p.HttpClient, p.SheetId);
    }


    // Make initial network calls to setup the plugin. 
    // Need this as a separate call from the ctor since ctors aren't async. 
    private InitAsync(): Promise<void> {
        return this._sheet.getInfoAsync().then(info => {
            this.updateInfo(info);
            
            return this._sheet.getSheetContentsAsync().then((contents) => {

                var mailList = MyPlugin.createMailList(contents);

                var e = document.getElementById("download");
                trchtml.DownloadHelper.appendDownloadCsvButton(e, () => {
                    this._sheet.postExport("mailer"); // Async call to log there was an export 
                    return mailList
                });
            })
        });
    }

    // Display sheet info on HTML page
    public updateInfo(info: trcSheet.ISheetInfoResult): void {
        $("#SheetName").text(info.Name);
        $("#RowCount").text(info.CountRecords.toLocaleString());
    }


    // Demonstrate receiving UI handlers 
    public onClickRefresh(): void {
        this.InitAsync().
            catch(showError);
    }

    // Merge logic: 
    // "Joe Smith" --> "Joe Smith"
    // "Joe Smith" + "Sue Smith" --> "Joe & Sue Smith"
    // "Joe Smith" + "Sue Jones" --> "Joe Smith & Sue Jones"
    public static createMailList(contents: ISheetContents): ISheetContents {
        var x: hh.IHousheholding = new hh.Householding(contents);

        var colRecId = contents[ColumnNames.RecId];
        var colFirstName = contents[ColumnNames.FirstName];
        var colLastName = contents[ColumnNames.LastName];
        var colAddress = contents[ColumnNames.Address];
        var colCity = contents[ColumnNames.City];
        var colZip = contents[ColumnNames.Zip];

        var households = new bcl.Dict<Household>();
        for(var i = 0; i < colRecId.length; i++) {
            var hhid = hh.Householding.calcHHID(colAddress[i], colCity[i], colZip[i]);

            var h : Household = households.get(hhid);
            if (h == undefined) 
            {
                h = new Household(colAddress[i], colCity[i], colZip[i]);
                households.add(hhid, h);
            }

            h.addName(colFirstName[i], colLastName[i]);
        }

        var mailer: ISheetContents = {}

        var kName = "Name";
        mailer[kName] = [];
        mailer[ColumnNames.Address] = [];
        mailer[ColumnNames.City] = [];
        mailer[ColumnNames.Zip] = [];

        households.forEach( (hhid, h) => {
            mailer[kName].push(h.getName());
            mailer[ColumnNames.Address].push(h._address);
            mailer[ColumnNames.City].push(h._city);
            mailer[ColumnNames.Zip].push(h._zip);
        });


        var count = households.getCount();

        $("#HouseholdCount").text(count.toLocaleString());

        return mailer;
    }
}



