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
  * Set reqLimit to your internet connection speed in Mbit/s (run speedtest.net) divided by 2.5, e.g 50Mbit/s will want a value of 20.
```javascript
var reqLimit = 30; // Max simultaneous requests. Required bandwidth in Mbit/s is 2.5 times this value.
```
  * Setting reqLimit too high will result in the script running slow, possibly getting stuck and never completing, or even crashing!
  * Do not exceed ~75 reqLimit, your IP may get temporarily blocked by Steam!

### Found this helpful and saved your bot?
  * Feel free to send some bitcoin my way;
```
1NvqNqZrcJuqq6rsPyB2CazapxCZ4Wk6Fs
```
  * Pay for a beer or two;
```
https://www.paypal.me/ValkyrieStar
```
