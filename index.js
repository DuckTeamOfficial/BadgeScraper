const async     = require('async');
const http      = require('http');
const fs        = require('fs');
var data        = require('./removedAppids.js');
var reqLimit    = 25; // Max simultaneous requests.

http.get("http://api.steampowered.com/ISteamApps/GetAppList/v0002/", (res) => {
    var body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        if(res.statusCode == 200) {
            body = JSON.parse(body);
            console.log("## Found " + body.applist.apps.length + " appids to scan for cards!");
            async.eachLimit(body.applist.apps, reqLimit, (app,callback) => {
                var retry = true;
                async.whilst(() => {
                    return retry;
                }, (cb) => {
                    http.get("http://steamcommunity.com/id/palmdesert/gamecards/" + app.appid + "/", (res) => {
                        var body = '';
                        res.setEncoding('utf8');
                        res.on('data', (chunk) => {
                            body += chunk;
                        });
                        res.on('end', () => {
                            if(res.statusCode == 200) {
                                var cardCount = (body.match(/game_card_ctn/g) || []).length;
                                var steamError = (body.match(/An error was encountered while processing your request:/g) || []).length;
                                var invalidGame = (body.match(/Invalid game/g) || []).length;
                                if(!steamError)
                                {
                                    retry = false;
                                    if(cardCount) {
                                        data[app.appid] = { appid: app.appid, count: cardCount };
                                    }
                                    cb(false, data[app.appid]);
                                } else {
                                    if (invalidGame) {
                                        retry = false;
                                    }
                                    cb();
                                }
                            } else if (res.statusCode == 302) {
                                retry = false;
                                cb();
                            } else {
                                console.log("## Unknown Response! Status Code: " + res.statusCode);
                                cb((res.statusCode==403)?true:false);
                            }
                        });
                        res.on('error', (err) => {
                            console.log("## Request failed: " + err);
                            cb(err);
                        });
                    });
                }, (err, res) => {
                    if(!err && res) {
                        console.log("## Badge found with appid " + res.appid + " and " + res.count + " cards, current total: " + Object.keys(data).length);
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
            console.log("## Failed to get appid list! Status Code: " + res.statusCode);
        }
    });
    res.on('error', (err) => {
        console.log("## Failed to get appid list: " + err);
    });
});
