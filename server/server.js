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
// CORS 설정: 프로덕션에서는 특정 origin만 허용하도록 설정
const getAllowedOrigins = () => {
  const origins = [];
  
  // 환경 변수에서 프런트엔드 URL 가져오기
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  if (process.env.CLIENT_ORIGIN) {
    origins.push(process.env.CLIENT_ORIGIN);
  }
  
  // 개발 환경에서는 localhost 허용
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173');
  }
  
  return origins.length > 0 ? origins : '*';
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // 개발 환경이거나 origin이 없으면 (같은 origin 요청) 허용
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // '*'인 경우 모든 origin 허용
    if (allowedOrigins === '*') {
      return callback(null, true);
    }
    
    // 배열인 경우 각 origin 확인
    if (Array.isArray(allowedOrigins)) {
      // 정확한 매칭
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Render Static Site 도메인 패턴 확인 (onrender.com)
      const isRenderDomain = origin.match(/^https:\/\/.*\.onrender\.com$/);
      if (isRenderDomain) {
        console.log('✅ Render 도메인 허용:', origin);
        return callback(null, true);
      }
    }
    
    // 허용되지 않은 origin (프로덕션에서는 차단, 개발에서는 허용)
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ CORS 차단된 origin:', origin);
      console.warn('허용된 origins:', allowedOrigins);
      // 프로덕션에서는 차단하지 않고 허용 (필요시 false로 변경)
      return callback(null, true);
    }
    
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const allowedOrigins = getAllowedOrigins();
console.log('🔧 CORS 설정:', {
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  allowedOrigins: allowedOrigins,
});

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

