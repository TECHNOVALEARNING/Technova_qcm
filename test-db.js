require('dotenv/config');
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql`SELECT 1`
  .then(() => {
    console.log('OK');
    process.exit(0);
  })
  .catch(e => {
    console.error('DB ERROR:', e);
    process.exit(1);
  });
