const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const { koaBody } = require('koa-body');
const router = new Router();
const { createClient } = require('redis');
const got = require('got');
var views = require('koa-views');

const render = views(__dirname + '/views', {
  map: {
    html: 'underscore'
  }
})

app.use(koaBody({ multipart: true }));
app.use(render)

const redisClient = createClient();
redisClient.on('error', err => console.log('Redis Client Error', err));

async function publishToRedis(value) {
  await redisClient.connect();
  await redisClient.rPush('queue', value);
  await redisClient.disconnect();
};

router.get('/', async ctx => {
  ctx.body = `<div style="background-color: #707bb2; margin: 15px; border-radius: 5px; padding: 15px; width: 180px">
  <b>Publish to Redis:</b>
  <form action="/publish" method="post">
      <p><input type=text name=publishValue>
      <p><input type=submit value="Publish">
  </form>
  </div>`;
});

router.post('/publish', async ctx => {
  const body = ctx.request.body;
  await publishToRedis(body.publishValue);
  ctx.redirect('/')
});

router.get('/read/:id', async ctx => {
  const id = ctx.params.id
  await got.get(`http://localhost:3001/${id}`, {responseType: 'json'})
    .then(res => {
      data = JSON.parse(res.body)
      response = `<div style="background-color: #707bb2; margin: 15px; border-radius: 5px; padding: 15px; width: 180px">
      <b>Entry ID: ${data.did}</b> 
      </div>
      <div style="background-color: #707bb2; margin: 15px; border-radius: 5px; padding: 15px; width: 180px">
      <b>Entry Value: ${data.example_value}</b>
      </div>`;
      ctx.body = response
    })
});

app.use(router.routes());
app.listen(3000);
