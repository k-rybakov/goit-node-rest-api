import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as createUsers from './20250618000001-create-users.js';
import * as addOwnerToContacts from './20250618000002-add-owner-to-contacts.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // This is needed for some cloud providers
    }
  }
});

async function dropTables() {
  try {
    await sequelize.query('DROP TABLE IF EXISTS contacts CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('Tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
}

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Drop existing tables first
    await dropTables();

    // Run migrations
    console.log('Running migrations...');
    
    await createUsers.up(sequelize.getQueryInterface());
    console.log('Users table created successfully');
    
    await addOwnerToContacts.up(sequelize.getQueryInterface());
    console.log('Owner column added to contacts table successfully');

    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations(); 