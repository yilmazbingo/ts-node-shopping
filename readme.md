## Production

https://ts-node-shopping.herokuapp.com/

```js
"scripts": {
    "clean": "rimraf build/*",
    "copy-assets": "ts-node src/tools/copyAssets",
    "tsc": " tsc",
    "build": "npm-run-all clean tsc copy-assets",
    "dev": "nodemon  --watch src -e ts,ejs --exec npm run dev:start",
    "dev:start": "npm-run-all build start",
    "start": "node -r dotenv/config build/index.js"
  },
```

**Start the app**

`npm run dev`

NOTE: Do not use concurently instead of "npm-run-all". it wont work

### Install Heroku n

`$ sudo npm i -g heroku`
