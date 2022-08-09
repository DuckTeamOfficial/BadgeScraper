// Required Modules
const async         = require("async");
const https         = require("https");
const fs            = require("fs");

// Constants
const download_dir  = "./temp/";  // Where to put temporary files, must exist!
const reqLimit      = 20;          // Max simultaneous requests.

// Our Set Data
var data            = require("./removedAppids.js");

// Download the file, synchronously, so we ensure all data is written before trying to read from it again.
function download_file(file_url,file_name)
{
    return new Promise((result) => {
        https.get(file_url, (response) => {
            var content = '';
            response.on("data", (data) => {
                content += data;
            }).on("end", () => {
                if(response.statusCode == 200)
                {
                    fs.writeFileSync(download_dir + file_name,content,"utf8");
                }
                result(response.statusCode);
            });
        }).on('error', (err) => {
            result(err);
        });
    });
};

// Delete a file
function delete_file(file_name)
{
    fs.unlink(download_dir + file_name, (err) => {});
};

// Must be async because we're using promises in our functions for synchronous-ness!
async function main()
{
    var result = await download_file("https://api.steampowered.com/ISteamApps/GetAppList/v2/","apidata");
    if (result != 200)
    {
        process.stdout.write("## Failed to get appid list! " + result + '\n');
        process.exit();
    }
    var jsonData = JSON.parse(fs.readFileSync(download_dir + "apidata","utf8"));
    delete_file("apidata");
    process.stdout.write("## Found " + jsonData.applist.apps.length + " appids to scan for cards!" + '\n');
    var complete = 0, time = 0;
    var printProgress = setInterval(() => {
        process.stdout.write("## Time Elapsed: " + ~~((time++)/2) + "s. AppIDs Scanned: " + complete + "/" + jsonData.applist.apps.length + ". Sets found: " + Object.keys(data).length + "." + '\r');
    }, 500);
    async.eachLimit(jsonData.applist.apps, reqLimit, (app,callback) => {
        async function run()
        {
            var retry = true;
            while(retry)
            {
                var result = await download_file("https://steamcommunity.com/id/palmdesert/gamecards/" + app.appid + "/", app.appid);
                if (result == 200) // Good!
                {
                    var rawdata = fs.readFileSync(download_dir + app.appid,"utf8");
                    var cardCount = (rawdata.match(/game_card_ctn/g) || []).length;
                    var invalidGame = (rawdata.match(/Invalid Game/i) || []).length;
                    delete_file(app.appid);
                    if (!invalidGame)
                    {
                        retry = false;
                        if(cardCount)
                        {
                            data[app.appid] = { appid: app.appid, count: cardCount };
                        }
                    }
                }
                else if (result == 302) // Game doesn't exist. Happens sometimes.
                {
                    retry = false;
                }
                else if (result == 403) // Error 403, we got rate limited :(
                {
                    retry = false;
                    callback(true); // Quit trying any more.
                }
                else
                {
                    process.stdout.clearLine();
                    process.stdout.write("## Unexpected HTTP response code: " + result + '\n');
                }
            }
            complete++; // So our timer knows how many we've done.
            callback(); // Move onto next appid.
        }
        run();
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
}

// Run it!
main();
