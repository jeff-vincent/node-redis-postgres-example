const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const { koaBody } = require('koa-body');
const router = new Router();
const { Pool } = require('pg')

const config = {
  user: 'postgres',
  host: '0.0.0.0',
  password: 'postgres',
  database: 'my_database'
};

const pool = new Pool(config);
app.use(koaBody({ multipart: true }));

router.get('/:id', async (ctx) => {
  const id = ctx.params.id
  console.log(id)
  result = await pool.query(`SELECT * FROM example WHERE did = ${id}`)
  ctx.body = result.rows[0]
});

app.use(router.routes());
app.listen(3001);
