import  Koa from 'koa';
const app = new Koa();
import  Router from 'koa-router';
import  { koaBody } from 'koa-body';
const router = new Router();
import { createClient } from 'redis';
import got from 'got';
// import views from 'koa-views';

const PORT = process.env.PORT
const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PORT = process.env.REDIS_PORT
const DB_SERVICE_HOST = process.env.DB_SERVICE_HOST
const DB_SERVICE_PORT = process.env.DB_SERVICE_PORT

// const render = views(__dirname + '/views', {
//   map: {
//     html: 'underscore'
//   }
// })

app.use(koaBody({ multipart: true }));
// app.use(render)

const redisClient = createClient({
  socket: {
      host: REDIS_HOST,
      port: REDIS_PORT
  }}
);

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
  await got.get(`http://${DB_SERVICE_HOST}:${DB_SERVICE_PORT}/${id}`, {responseType: 'json'})
    .then(res => {
      const response = `<div style="background-color: #707bb2; margin: 15px; border-radius: 5px; padding: 15px; width: 180px">
      <b>Entry ID: ${res.body.did}</b> 
      </div>
      <div style="background-color: #707bb2; margin: 15px; border-radius: 5px; padding: 15px; width: 180px">
      <b>Entry Value: ${res.body.example_value}</b>
      </div>`;
      ctx.body = response
    })
});

app.use(router.routes());
app.listen(PORT);
