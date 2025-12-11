import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const dbName = process.env.DB_NAME || 'cozy_coffee';

async function createDatabase() {
  // postgres 데이터베이스에 연결하여 새 데이터베이스 생성
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // 기본 데이터베이스
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await adminClient.connect();
    console.log('✅ PostgreSQL 서버에 연결되었습니다.');

    // 데이터베이스 존재 여부 확인
    const checkDbQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1;
    `;
    const dbExists = await adminClient.query(checkDbQuery, [dbName]);

    if (dbExists.rows.length > 0) {
      console.log(`ℹ️  데이터베이스 '${dbName}'가 이미 존재합니다.`);
    } else {
      // 데이터베이스 생성
      await adminClient.query(`CREATE DATABASE ${dbName};`);
      console.log(`✅ 데이터베이스 '${dbName}'가 생성되었습니다.`);
    }

    await adminClient.end();
    console.log('\n💡 이제 다음 명령어를 실행하세요:');
    console.log('   npm run db:init');
  } catch (error) {
    console.error('❌ 데이터베이스 생성 오류:', error.message);
    console.error('\n💡 다음 사항을 확인하세요:');
    console.error('  1. PostgreSQL이 실행 중인지 확인');
    console.error('  2. .env 파일의 DB_USER와 DB_PASSWORD가 올바른지 확인');
    console.error('  3. 사용자에게 데이터베이스 생성 권한이 있는지 확인');
    process.exit(1);
  }
}

createDatabase();

