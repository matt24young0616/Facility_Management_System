import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'Nascar06160614!',
  database: 'Facility_Management_System',
});

export default pool;