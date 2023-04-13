const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const { koaBody } = require('koa-body');
const router = new Router();
const { Pool } = require('pg')

const PORT = process.env.PORT
const POSTGRES_USER = process.env.POSTGRES_USER
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD
const POSTGRES_HOST = process.env.POSTGRES_HOST
const POSTGRES_PORT = process.env.POSTGRES_PORT
const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE

const config = {
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE
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
app.listen(PORT);
