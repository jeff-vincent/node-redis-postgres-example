const { createClient } = require('redis');
const { Pool } = require('pg')

const POSTGRES_USER = process.env.POSTGRES_USER
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD
const POSTGRES_HOST = process.env.POSTGRES_HOST
const POSTGRES_PORT = process.env.POSTGRES_PORT
const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE
const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PORT = process.env.REDIS_PORT

const redisClient = createClient({
  socket: {
      host: REDIS_HOST,
      port: REDIS_PORT
  }}
);

redisClient.on('error', err => console.log('Redis Client Error', err));

const config = {
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE
};

const pool = new Pool(config);

async function readFromRedis(ctx) {
  await redisClient.connect();
  const value = await redisClient.blPop('queue', 10, (err, reply) => {
    console.log(reply)});
  await redisClient.disconnect();
  return value;
};

async function createDBTable() {
  const client = await pool.connect()
  const table = 'example';
    try {
    const res = await client.query(`CREATE TABLE ${table} (
      did    integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
      example_value   varchar(40) NOT NULL CHECK (example_value <> '')); `)
    console.log(res)
    } catch (err) {
      console.log(err.stack)
    } finally {
      client.release()
    }
  }

async function writeToDB(value){
  const text = 'INSERT INTO example(example_value) VALUES($1) RETURNING *'
  const values = [value]
  pool.query(text, values, (err, res) => {
    if (err) {
      return console.error('Error executing query', err.stack)
    } else {
      console.log(res.rows[0])
    }
  })
}

async function main() {
  while(true) {
    value = await readFromRedis()
    console.log(value)
    if (value !== null) {
      console.log(value.element)
      await writeToDB(value.element)
    };
  };
};

createDBTable()
main()
