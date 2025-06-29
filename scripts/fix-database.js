const { Client } = require('pg');
require('dotenv').config();

async function fixDatabase() {
  console.log('🔄 Starting database migration fix...');

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'your_database',
    username: process.env.DB_USERNAME || 'your_username',
    password: process.env.DB_PASSWORD || 'your_password',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if processed_articles table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'processed_articles'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('ℹ️ processed_articles table does not exist, no migration needed');
      return;
    }

    // Check if cleanContent column exists
    const cleanContentExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'processed_articles' 
        AND column_name = 'cleanContent'
      );
    `);

    if (cleanContentExists.rows[0].exists) {
      console.log('📋 Found cleanContent column, starting migration...');

      // Add content column if it doesn't exist
      const contentExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'processed_articles' 
          AND column_name = 'content'
        );
      `);

      if (!contentExists.rows[0].exists) {
        await client.query('ALTER TABLE processed_articles ADD COLUMN content TEXT;');
        console.log('➕ Added content column');
      }

      // Copy data from cleanContent to content
      const updateResult = await client.query(`
        UPDATE processed_articles 
        SET content = "cleanContent" 
        WHERE content IS NULL AND "cleanContent" IS NOT NULL;
      `);
      console.log(`📝 Migrated ${updateResult.rowCount} rows from cleanContent to content`);

      // Drop the old cleanContent column
      await client.query('ALTER TABLE processed_articles DROP COLUMN "cleanContent";');
      console.log('🗑️ Dropped cleanContent column');
    } else {
      console.log('ℹ️ cleanContent column not found, no data migration needed');
    }

    // Check and drop originalHtml column if it exists
    const originalHtmlExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'processed_articles' 
        AND column_name = 'originalHtml'
      );
    `);

    if (originalHtmlExists.rows[0].exists) {
      await client.query('ALTER TABLE processed_articles DROP COLUMN "originalHtml";');
      console.log('🗑️ Dropped originalHtml column');
    }

    // Ensure content column exists and set default for NULL values
    const contentColumnExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'processed_articles' 
        AND column_name = 'content'
      );
    `);

    if (!contentColumnExists.rows[0].exists) {
      await client.query('ALTER TABLE processed_articles ADD COLUMN content TEXT;');
      console.log('➕ Added content column');
    }

    // Set default value for any NULL content
    const nullContentUpdate = await client.query(`
      UPDATE processed_articles 
      SET content = 'Content not available' 
      WHERE content IS NULL;
    `);
    
    if (nullContentUpdate.rowCount > 0) {
      console.log(`📝 Set default content for ${nullContentUpdate.rowCount} NULL rows`);
    }

    // Make content NOT NULL
    await client.query('ALTER TABLE processed_articles ALTER COLUMN content SET NOT NULL;');
    console.log('✅ Set content column to NOT NULL');

    console.log('🎉 Database migration fix completed successfully!');

  } catch (error) {
    console.error('🔴 Database migration fix failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the fix
fixDatabase(); 