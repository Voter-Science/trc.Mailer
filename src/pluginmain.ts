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
                trchtml.DownloadHelper.appendDownloadCsvButton(e, () => mailList);
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


    public static createMailList(contents: ISheetContents): ISheetContents {
        var x: hh.IHousheholding = new hh.Householding(contents);

        var colRecId = contents[ColumnNames.RecId];
        var colFirstName = contents[ColumnNames.FirstName];
        var colLastName = contents[ColumnNames.LastName];
        var colAddress = contents[ColumnNames.Address];
        var colCity = contents[ColumnNames.City];
        var colZip = contents[ColumnNames.Zip];

        var mailer: ISheetContents = {}

        mailer[ColumnNames.FirstName] = colFirstName;
        mailer[ColumnNames.LastName] = colLastName;
        mailer[ColumnNames.Address] = colAddress;
        mailer[ColumnNames.City] = colCity;
        mailer[ColumnNames.Zip] = colZip;


        var unique: any = {}

        var count = 0;

        var mailer2 = SheetContents.KeepRows(mailer, (i) => {
            var hhid = hh.Householding.calcHHID(colAddress[i], colCity[i], colZip[i]);

            if (unique.hasOwnProperty(hhid)) {
                return false; // already present. 
            } else {
                unique[hhid] = true;
                count++;
                return true;
            }
        })

        $("#HouseholdCount").text(count.toLocaleString());

        return mailer2;

    }
}
