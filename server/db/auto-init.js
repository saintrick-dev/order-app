/**
 * 배포 시 자동으로 데이터베이스를 초기화하는 스크립트
 * 서버 시작 시 한 번만 실행되도록 보장합니다.
 */
import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INIT_FLAG_FILE = path.join(__dirname, '.db-initialized');

async function checkIfInitialized() {
  try {
    // 초기화 플래그 파일 확인
    if (fs.existsSync(INIT_FLAG_FILE)) {
      console.log('📋 데이터베이스가 이미 초기화되었습니다.');
      return true;
    }

    // 데이터베이스에 테이블이 있는지 확인
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'menus'
      );
    `);

    if (result.rows[0].exists) {
      // 테이블이 있으면 메뉴 데이터 확인
      const menuCount = await pool.query('SELECT COUNT(*) FROM menus');
      if (menuCount.rows[0].count > 0) {
        console.log('✅ 데이터베이스에 이미 데이터가 있습니다.');
        // 플래그 파일 생성
        fs.writeFileSync(INIT_FLAG_FILE, new Date().toISOString());
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ 초기화 상태 확인 오류:', error.message);
    return false;
  }
}

async function autoInitDatabase() {
  try {
    // 이미 초기화되었는지 확인
    const isInitialized = await checkIfInitialized();
    if (isInitialized) {
      return;
    }

    console.log('🚀 데이터베이스 자동 초기화 시작...');

    // init.js 실행
    const { default: initDatabase } = await import('./init.js');
    await initDatabase();

    // 초기화 플래그 파일 생성
    fs.writeFileSync(INIT_FLAG_FILE, new Date().toISOString());
    console.log('✅ 데이터베이스 자동 초기화 완료!');
  } catch (error) {
    console.error('❌ 데이터베이스 자동 초기화 오류:', error);
    // 오류가 발생해도 서버는 계속 실행되도록 함
  }
}

// 환경 변수로 자동 초기화 활성화/비활성화 제어
if (process.env.AUTO_INIT_DB === 'true') {
  autoInitDatabase();
}

export default autoInitDatabase;

