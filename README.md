# BadgeScraper
Gets the data required by some Steam Trading Card bots.

### Requirements

1. Node.js
```
apt-get install nodejs
```
2. NPM (Node.js Package Manager)
```
apt-get install npm
```

### How to Install / Run
1. Clone this Git
```
git clone https://github.com/SpartanC001/BadgeScraper.git
```
2. Install Node.js Packages
```
npm i
```
3. Run it!
```
node index.js
```

### Modifying Bot Code
1. In *package.json* add these lines in the *dependancies* section;
```json
"path": "*",
"fs": "*"
```
2. In *utils.js* add these lines at the top of the file;
```javascript
var fs = require('fs');
var fs = require('path');
```
3. In *utils.js* replace *t.getCardsInSets* function with the following;
```javascript
t.getCardsInSets = (callback) => {
    fs.readFile(path.join(__dirname,'.','set_data.json'), 'utf8', (err,data) => {
        if (err) {
            callback(err);
        }
        callback(null, JSON.parse(data));
    });
};
```
3. Update Node Packages for Bot (make sure your terminal/cmd is pointed to your bot's directory)
```
npm i
```
4. Place your *set_data.json* in the directory along with the bot files.
5. You're good to go! Your bot should now work again with correct set data!

### Notes
  * Script may take 30 minutes or more to complete!
  * set_data.json is only provided once the script completes.
