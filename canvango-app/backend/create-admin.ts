import bcrypt from 'bcrypt';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createAdmin() {
  try {
    // Generate password hash
    const adminPassword = 'Admin123!';
    const memberPassword = 'Member123!';
    
    const adminHash = await bcrypt.hash(adminPassword, 10);
    const memberHash = await bcrypt.hash(memberPassword, 10);
    
    console.log('Creating users...');
    
    // Delete existing users
    await pool.query(`DELETE FROM users WHERE email IN ('admin@canvango.com', 'member@canvango.com')`);
    
    // Insert admin
    await pool.query(
      `INSERT INTO users (username, email, password, full_name, role, balance) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['admin', 'admin@canvango.com', adminHash, 'Administrator', 'admin', 0]
    );
    
    // Insert member
    await pool.query(
      `INSERT INTO users (username, email, password, full_name, role, balance) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['member', 'member@canvango.com', memberHash, 'Member User', 'member', 100000]
    );
    
    console.log('✅ Users created successfully!');
    console.log('\nLogin Credentials:');
    console.log('==================');
    console.log('\nAdmin:');
    console.log('  Email: admin@canvango.com');
    console.log('  Password: Admin123!');
    console.log('\nMember:');
    console.log('  Email: member@canvango.com');
    console.log('  Password: Member123!');
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
