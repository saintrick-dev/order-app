import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Render.com의 DATABASE_URL 지원
let poolConfig;
if (process.env.DATABASE_URL) {
  // DATABASE_URL 형식: postgresql://user:password@host:port/database
  // Render.com 데이터베이스는 SSL이 필요함
  const isRenderDB = process.env.DATABASE_URL.includes('render.com') || 
                     process.env.DATABASE_URL.includes('onrender.com');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isRenderDB ? { rejectUnauthorized: false } : false,
  };
} else {
  // 개별 환경 변수 사용
  const isRenderHost = process.env.DB_HOST?.includes('render.com') || 
                       process.env.DB_HOST?.includes('onrender.com');
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'cozy_coffee',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: isRenderHost ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool(poolConfig);

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('❌ 데이터베이스 연결 오류:', err);
});

export default pool;

