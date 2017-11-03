const request   = require('request');
const async     = require('async');
const fs        = require('fs');
var data        = require('./removedAppids.js');
var reqLimit    = 30; // Max simultaneous requests. Required bandwidth in Mbit/s is 2.5 times this value.

request("http://api.steampowered.com/ISteamApps/GetAppList/v0002/", { json: true }, (err, res, body) => {
    if (!err && res.statusCode == 200 && body) {
        console.log("## Found " + body.applist.apps.length + " appids to scan for cards!");
        async.eachLimit(body.applist.apps, reqLimit, (app,callback) => {
            request("http://steamcommunity.com/id/palmdesert/gamecards/" + app.appid + "/", (err, res, body) => {
                if (!err && res.statusCode == 200 && body) {
                    var count = (body.match(/game_card_ctn/g) || []).length;
                    if(count) {
                        data[app.appid] = { appid: app.appid, count: count };
                        console.log("## Found appid " + app.appid + " with " + count + " cards, current sets found: " Object.keys(data).length);
                    } else {
                        console.log("## Skipping appid " + app.appid + " because it has no cards.");
                    }
                } else {
                    console.log("## An error occured getting badge data for appid " + appid + ": " + (err?err:res.statusCode));
                    process.exit();
                }
                callback();
            });
        }, function(err) {
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
