const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addProfilePictureColumn() {
  try {
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_picture TEXT
    `;
    console.log('✅ Columna profile_picture agregada a la tabla users');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addProfilePictureColumn();
