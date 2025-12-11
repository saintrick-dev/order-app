import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import menusRouter from './routes/menus.js';
import ordersRouter from './routes/orders.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
// CORS 설정: 프로덕션에서는 특정 origin만 허용하도록 설정 가능
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // 프로덕션에서는 실제 프론트엔드 URL로 변경
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: 'COZY Coffee API Server',
    version: '1.0.0'
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1'); // 간단한 쿼리로 DB 상태 확인
    res.json({ status: 'OK', database: 'connected' });
  } catch (error) {
    console.error('Health check DB error:', error.message);
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: error.message });
  }
});

// API 라우트
app.use('/api/menus', menusRouter);
app.use('/api/orders', ordersRouter);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '서버 내부 오류가 발생했습니다.'
    }
  });
});

// 404 핸들링
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '요청한 리소스를 찾을 수 없습니다.'
    }
  });
});

// 데이터베이스 연결 테스트
async function testDbConnection() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL 데이터베이스에 성공적으로 연결되었습니다.');
  } catch (error) {
    console.error('❌ PostgreSQL 데이터베이스 연결 실패:', error.message);
    process.exit(1); // 연결 실패 시 서버 종료
  }
}

// 서버 시작 전 데이터베이스 연결 테스트
testDbConnection();

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// 서버 종료 시 데이터베이스 연결 정리
process.on('SIGTERM', async () => {
  console.log('SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
  server.close(() => {
    console.log('HTTP 서버가 종료되었습니다.');
  });
  await pool.end();
  console.log('데이터베이스 연결이 종료되었습니다.');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT 신호를 받았습니다. 서버를 종료합니다...');
  server.close(() => {
    console.log('HTTP 서버가 종료되었습니다.');
  });
  await pool.end();
  console.log('데이터베이스 연결이 종료되었습니다.');
  process.exit(0);
});

