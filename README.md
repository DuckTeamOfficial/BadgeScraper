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
1. In *utils.js* add these lines at the top of the file;
```javascript
var fs = require('fs');
var path = require('path');
```
2. In *utils.js* replace *t.getCardsInSets* function with the following;
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
3. Place your *set_data.json* in the directory along with the bot files.
4. You're good to go! Your bot should now work again with correct set data!

### Notes
  * Script may take 30 minutes or more to complete!
  * set_data.json is only provided once the script completes.
  * If the script freezes, and your machine has low ram capacity, reducing the request rate may help (see below).
  * If you have a slower connection, try reducing the rate at which it makes requests, note that too short interval may result in requests getting stuck, could cause high memory usage, and the script may not complete (or it may complete with invalid data).
```javascript
waitCount*30 // In line 26, increase 30 to 50 or 100. This is how many milliseconds between requests!
```

### Found this helpful and saved your bot?
  * Feel free to send some bitcoin my way;
```
1NvqNqZrcJuqq6rsPyB2CazapxCZ4Wk6Fs
```
