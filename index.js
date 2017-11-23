const request   = require('request');
const async     = require('async');
const fs        = require('fs');
var data        = require('./removedAppids.js');
var reqLimit    = 10; // Max simultaneous requests. Required bandwidth in Mbit/s is 2.5 times this value.

request("http://api.steampowered.com/ISteamApps/GetAppList/v0002/", { json: true }, (err, res, body) => {
    if (!err && res.statusCode == 200 && body) {
        console.log("## Found " + body.applist.apps.length + " appids to scan for cards!");
        async.eachLimit(body.applist.apps, reqLimit, (app,callback) => {
            var success = false;
            async.whilst(() => {
                return !success;
            }, (cb) => {
                request("http://steamcommunity.com/id/palmdesert/gamecards/" + app.appid + "/", (err, res, body) => {
                    if (res.statusCode == 200 && body) {
                        success = true;
                        var count = (body.match(/game_card_ctn/g) || []).length;
                        if(count) {
                            data[app.appid] = { appid: app.appid, count: count };
                        }
                        cb(false, [ app.appid, count ]);
                    } else {
                        console.log("## Steam gave us an error code: " + res.statusCode);
                        cb((res.statusCode==403)?true:false);
                    }
                });
            }, (err, res) => {
                if(!err && res[1]) {
                    console.log("## Found appid " + res[0] + " with badge, current total: " + Object.keys(data).length);
                }
                callback(err);
            });
        }, (err) => {
            if (err) {
                console.log("## Aborting! Got error 403, we are rate limited! Reduce reqLimit value!");
                process.exit();
            }
            console.log("## Scanning complete, found a total of " + Object.keys(data).length + " sets.")
            console.log("## Writing set data to file...");
            fs.writeFile('./set_data.json', JSON.stringify(data), (err) => {
                if(err) {
                    console.log("## Failed to write JSON file: " + err);
                }
                console.log("## All data written to file, mission complete!");
            });
        });
    } else {
        console.log("## An error occured getting appids: " + (err?err:res.statusCode));
    }
});
