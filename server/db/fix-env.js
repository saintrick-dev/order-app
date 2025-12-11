/**
 * 환경 변수 자동 수정 스크립트
 * DB_HOST에 잘못 포함된 데이터베이스 이름을 제거
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const envPath = path.join(__dirname, '..', '.env');

console.log('🔧 환경 변수 수정 중...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env 파일을 찾을 수 없습니다:', envPath);
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');
let modified = false;

// DB_HOST에서 잘못된 부분 제거
if (process.env.DB_HOST && process.env.DB_HOST.includes('/')) {
  const oldHost = process.env.DB_HOST;
  const newHost = oldHost.split('/')[0];
  
  console.log('📝 DB_HOST 수정:');
  console.log('   이전:', oldHost);
  console.log('   이후:', newHost);
  
  envContent = envContent.replace(
    new RegExp(`DB_HOST=.*`, 'g'),
    `DB_HOST=${newHost}`
  );
  
  modified = true;
}

if (modified) {
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ .env 파일이 수정되었습니다.');
  console.log('   변경사항을 적용하려면 서버를 재시작하거나 환경 변수를 다시 로드하세요.');
} else {
  console.log('ℹ️  수정할 내용이 없습니다.');
}

