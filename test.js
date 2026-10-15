import pool from './db.js';

async function test() {
  const result = await pool.query('SELECT NOW()');
  console.log(result.rows);
  process.exit();
}

test();
