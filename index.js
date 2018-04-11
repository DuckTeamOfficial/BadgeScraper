const async     = require('async');
const https     = require('https');
const fs        = require('fs');
var data        = require('./removedAppids.js');
var reqLimit    = 25; // Max simultaneous requests.

https.get("https://api.steampowered.com/ISteamApps/GetAppList/v0002/", (res) => {
    var body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        if(res.statusCode == 200) {
            var complete = 0, time = 0;
            body = JSON.parse(body);
            process.stdout.write("## Found " + body.applist.apps.length + " appids to scan for cards!" + '\n');
            var printProgress = setInterval(() => {
                process.stdout.write("## Time Elapsed: " + (time+=1) + "s. AppIDs Scanned: " + complete + "/" + body.applist.apps.length + ". Sets found: " + Object.keys(data).length + "." + '\r');
            }, 1000);
            async.eachLimit(body.applist.apps, reqLimit, (app,callback) => {
                complete++;
                var retry = true;
                async.whilst(() => {
                    return retry;
                }, (cb) => {
                    https.get("https://steamcommunity.com/id/palmdesert/gamecards/" + app.appid + "/", (res) => {
                        if(res.statusCode == 200) {
                            var body = '';
                            res.setEncoding('utf8');
                            res.on('data', (chunk) => {
                                body += chunk;
                            });
                            res.on('end', () => {
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
                                    retry = !invalidGame;
                                    cb();
                                }
                            });
                        } else if (res.statusCode == 302) {
                            retry = false;
                            cb();
                        } else {
                            cb((res.statusCode==403)?true:false);
                        }
                    }).on('error', (err) => {
                        cb();
                    });
                }, (err, res) => {
                    callback(err);
                });
            }, (e403) => {
                clearInterval(printProgress);
                process.stdout.clearLine();
                if (e403) {
                    process.stdout.write("## Aborting! Got error 403, we are rate limited! Reduce reqLimit value!" + '\n');
                    process.exit();
                }
                process.stdout.write("## Scanning complete, found a total of " + Object.keys(data).length + " sets." + '\n')
                process.stdout.write("## Writing set data to file..." + '\n');
                fs.writeFile('./set_data.json', JSON.stringify(data), (err) => {
                    if(err) {
                        process.stdout.write("## Failed to write JSON file: " + err + '\n');
                    } else {
                        process.stdout.write("## All data written to file, mission complete!" + '\n');
                    }
                    process.exit();
                });
            });
        } else {
            process.stdout.write("## Failed to get appid list! Status Code: " + res.statusCode + '\n');
        }
    });
}).on('error', (err) => {
   process.stdout.write("## Request Failed! " + err + '\n');
});