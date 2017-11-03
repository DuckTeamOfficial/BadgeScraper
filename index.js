const request   = require('request');
const async     = require('async');
const fs        = require('fs');
var data        = require('./removedAppids.js');
var reqLimit    = 30; // Max simultaneous requests. Required bandwidth in Mbit/s is 2.5 times this value.

request("http://api.steampowered.com/ISteamApps/GetAppList/v0002/", { json: true }, (err, res, body) => {
    if (!err && res.statusCode == 200 && body) {
        console.log("## found " + body.applist.apps.length + " appids to scan!");

        async.eachLimit(body.applist.apps, reqLimit, (app,callback) => {
            request("http://steamcommunity.com/id/palmdesert/gamecards/" + app.appid + "/", (err, res, body) => {
                if (!err && res.statusCode == 200 && body) {
                    var count = (body.match(/game_card_ctn/g) || []).length;
                    if(count) {
                        data[app.appid] = { appid: app.appid, count: count };
                    }
                    console.log("## appid " + app.appid + " has " + (count?count:"no") + " cards.");
                } else {
                    console.log("## an error occured getting badge data for appid " + appid + ": " + (err?err:res.statusCode));
                    process.exit();
                }
                callback();
            });
        }, function(err) {
            console.log("## scanning complete, found " + Object.keys(data).length + " appids with cards.")
            console.log("## writing data to file...");
            fs.writeFile('./set_data.json', JSON.stringify(data), (err) => {
                if(err) {
                    console.log("## failed to write JSON file: " + err);
                }
                console.log("## all data written to file.");
            });
        });
    } else {
        console.log("## an error occured getting appids: " + (err?err:res.statusCode));
    }
});
