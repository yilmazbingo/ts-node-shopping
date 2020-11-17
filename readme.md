```
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

NOTE: do not use concurently instead of npm-run-all. it wont work

### Install Heroku n

`$ sudo npm i -g heroku`

### Create Stripe Session in node:

```
    const session = stripe.checkout.sessions.create({
      payment_method_types:['card'],
      line_items:products.map((p)=>{
        return {
          name:p.productId.title,
          description:p.productId.description,
          amount:p.productId.price*100,//CENTS
          currency:"usd",
          quantity:p.quantity
        }
      }),
      success_url:req.protocol+'//'+req.get('host')+'/checkout/success',
      cancel_url:req.protocol+'//'+req.get('host')+'/checkout/cancel'
```
