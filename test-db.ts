import 'dotenv/config';
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);
sql`SELECT * FROM users`
  .then((res) => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch(e => {
    console.error('DB ERROR:', e);
    process.exit(1);
  });
