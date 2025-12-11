import pool from '../config/database.js';

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ 데이터베이스 연결 성공!');
    console.log('현재 시간:', result.rows[0].now);
    
    // 테이블 목록 확인
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 생성된 테이블:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    console.error('\n💡 다음 사항을 확인하세요:');
    console.error('  1. PostgreSQL이 실행 중인지 확인');
    console.error('  2. .env 파일의 데이터베이스 정보가 올바른지 확인');
    console.error('  3. 데이터베이스가 생성되었는지 확인');
    process.exit(1);
  }
}

testConnection();

