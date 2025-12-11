/**
 * 환경 변수 확인 스크립트
 * DATABASE_URL 또는 개별 환경 변수가 올바르게 설정되었는지 확인
 */
import dotenv from 'dotenv';

dotenv.config();

console.log('📋 환경 변수 확인:\n');

if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL이 설정되어 있습니다.');
  const url = process.env.DATABASE_URL;
  
  // URL 파싱 (비밀번호는 마스킹)
  try {
    const urlObj = new URL(url);
    console.log('   형식:', urlObj.protocol);
    console.log('   호스트:', urlObj.hostname);
    console.log('   포트:', urlObj.port || '5432 (기본값)');
    console.log('   데이터베이스:', urlObj.pathname.replace('/', ''));
    console.log('   사용자:', urlObj.username);
    console.log('   비밀번호:', urlObj.password ? '***' : '(없음)');
    
    // Render.com 데이터베이스 확인
    if (url.includes('render.com') || url.includes('onrender.com')) {
      console.log('\n✅ Render.com 데이터베이스로 감지되었습니다.');
      console.log('   SSL 연결이 필요합니다.');
    }
  } catch (error) {
    console.error('❌ DATABASE_URL 파싱 오류:', error.message);
    console.log('   전체 URL:', url.substring(0, 50) + '...');
  }
} else {
  console.log('ℹ️  DATABASE_URL이 설정되지 않았습니다. 개별 환경 변수를 사용합니다.');
  console.log('   DB_HOST:', process.env.DB_HOST || '(설정 안 됨)');
  console.log('   DB_PORT:', process.env.DB_PORT || '(설정 안 됨)');
  console.log('   DB_NAME:', process.env.DB_NAME || '(설정 안 됨)');
  console.log('   DB_USER:', process.env.DB_USER || '(설정 안 됨)');
  console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : '(설정 안 됨)');
  
  // Render.com 호스트 확인
  if (process.env.DB_HOST?.includes('render.com') || process.env.DB_HOST?.includes('onrender.com')) {
    console.log('\n✅ Render.com 데이터베이스로 감지되었습니다.');
    console.log('   SSL 연결이 필요합니다.');
  }
}

console.log('\n📝 NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('📝 PORT:', process.env.PORT || '3000');

