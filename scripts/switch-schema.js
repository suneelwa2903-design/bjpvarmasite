#!/usr/bin/env node

/**
 * Script to switch between SQLite (local) and PostgreSQL (production) schemas
 * 
 * Usage:
 *   node scripts/switch-schema.js sqlite    # Switch to SQLite for local dev
 *   node scripts/switch-schema.js postgres   # Switch to PostgreSQL for production
 */

const fs = require('fs');
const path = require('path');

const schemaDir = path.join(__dirname, '..', 'prisma');
const sqliteSchema = path.join(schemaDir, 'schema.sqlite.prisma');
const postgresSchema = path.join(schemaDir, 'schema.postgres.prisma');
const currentSchema = path.join(schemaDir, 'schema.prisma');

const target = process.argv[2]?.toLowerCase();

if (!target || !['sqlite', 'postgres', 'postgresql'].includes(target)) {
  console.error('Usage: node scripts/switch-schema.js [sqlite|postgres]');
  console.error('');
  console.error('  sqlite   - Switch to SQLite schema for local development');
  console.error('  postgres - Switch to PostgreSQL schema for production');
  process.exit(1);
}

const isPostgres = target === 'postgres' || target === 'postgresql';
const sourceSchema = isPostgres ? postgresSchema : sqliteSchema;
const targetName = isPostgres ? 'PostgreSQL' : 'SQLite';

if (!fs.existsSync(sourceSchema)) {
  console.error(`Error: Source schema file not found: ${sourceSchema}`);
  process.exit(1);
}

try {
  // Read the source schema
  const schemaContent = fs.readFileSync(sourceSchema, 'utf8');
  
  // Write to the main schema file
  fs.writeFileSync(currentSchema, schemaContent, 'utf8');
  
  console.log(`✓ Switched to ${targetName} schema`);
  console.log(`  Source: ${path.basename(sourceSchema)}`);
  console.log(`  Target: ${path.basename(currentSchema)}`);
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Make sure your DATABASE_URL in .env points to ${targetName}`);
  if (isPostgres) {
    console.log('     DATABASE_URL="postgresql://user:pass@host:5432/db"');
  } else {
    console.log('     DATABASE_URL="file:./prisma/dev.db"');
  }
  console.log('  2. Run: npx prisma generate');
  console.log('  3. Run: npx prisma db push (or migrate)');
} catch (error) {
  console.error(`Error switching schema: ${error.message}`);
  process.exit(1);
}

