# Render 배포 환경 연결 문제 해결 가이드

## 문제점

Render에 배포된 프런트엔드와 백엔드가 연동되지 않는 주요 원인:

1. **CORS 설정 문제**: 백엔드가 프런트엔드 URL을 허용하지 않음
2. **환경 변수 설정 문제**: Vite는 빌드 시점에 환경 변수를 주입하므로, Render에서 설정해야 함
3. **API URL 문제**: 프로덕션 환경에서 API URL이 올바르게 설정되지 않음

## 해결 방법

### 1. 백엔드 환경 변수 설정 (Render Web Service)

Render 대시보드에서 백엔드 Web Service의 **Environment Variables**에 추가:

| Key | Value | 설명 |
|-----|-------|------|
| `FRONTEND_URL` | `https://your-frontend.onrender.com` | 프런트엔드 URL (프로토콜 포함) |
| `NODE_ENV` | `production` | 프로덕션 환경 표시 |
| `DATABASE_URL` | (자동 설정) | PostgreSQL 연결 URL |
| `PORT` | (자동 설정) | 서버 포트 |

**중요**: 
- `FRONTEND_URL`에는 **프로토콜(`https://`)을 포함**해야 합니다
- 마지막에 **슬래시(`/`)를 포함하지 마세요**

예시:
```
FRONTEND_URL=https://cozy-coffee-frontend.onrender.com
```

### 2. 프런트엔드 환경 변수 설정 (Render Static Site)

Render 대시보드에서 프런트엔드 Static Site의 **Environment Variables**에 추가:

| Key | Value | 설명 |
|-----|-------|------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` | 백엔드 API URL |

**중요**: 
- 환경 변수 이름은 반드시 **`VITE_`로 시작**해야 합니다
- 값에는 **프로토콜(`https://`)을 포함**해야 합니다
- 마지막에 **`/api`를 포함**해야 합니다

예시:
```
VITE_API_URL=https://cozy-coffee-backend.onrender.com/api
```

### 3. 배포 순서

1. **백엔드 먼저 배포**
   - 환경 변수 설정 후 배포
   - 배포 완료 후 백엔드 URL 확인

2. **프런트엔드 배포**
   - 백엔드 URL을 사용하여 `VITE_API_URL` 설정
   - 환경 변수 설정 후 배포

### 4. 배포 후 확인

#### 백엔드 확인
1. Health Check: `https://your-backend.onrender.com/health`
2. API 테스트: `https://your-backend.onrender.com/api/menus`

#### 프런트엔드 확인
1. 브라우저 개발자 도구(F12) → Console 탭
2. API Base URL이 올바르게 표시되는지 확인
3. Network 탭에서 API 요청이 성공하는지 확인

## 코드 수정 사항

### 1. 백엔드 CORS 설정 개선 (`server/server.js`)
- 여러 origin 허용 (배열 및 정규식 지원)
- Render Static Site 도메인 자동 허용 (`*.onrender.com`)
- 개발 환경에서 localhost 허용

### 2. 프런트엔드 API 유틸리티 개선 (`ui/src/utils/api.js`)
- 환경 변수 디버깅 로그 추가
- API URL 확인을 위한 콘솔 로그 추가

## 문제 해결 체크리스트

- [ ] 백엔드 `FRONTEND_URL` 환경 변수 설정 확인
- [ ] 프런트엔드 `VITE_API_URL` 환경 변수 설정 확인
- [ ] 백엔드가 실행 중인지 확인 (Health Check)
- [ ] 브라우저 콘솔에서 API URL 확인
- [ ] 브라우저 Network 탭에서 CORS 오류 확인
- [ ] 백엔드 로그에서 CORS 관련 메시지 확인

## 일반적인 오류 및 해결

### CORS 오류
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**해결**:
1. 백엔드 `FRONTEND_URL` 환경 변수가 정확한지 확인
2. 백엔드 서버 재배포
3. 브라우저 캐시 클리어

### API 연결 실패
```
Failed to fetch
```

**해결**:
1. `VITE_API_URL` 환경 변수가 올바른지 확인
2. 백엔드 URL이 올바른지 확인 (Health Check로 테스트)
3. 프런트엔드 재배포 (환경 변수 변경 후)

### 빈 화면 또는 데이터 없음

**해결**:
1. 브라우저 콘솔에서 에러 메시지 확인
2. Network 탭에서 API 요청 상태 확인
3. 백엔드 로그 확인

## 추가 디버깅

### 브라우저 콘솔에서 확인
```javascript
// API URL 확인
console.log('API URL:', import.meta.env.VITE_API_URL);

// API 요청 테스트
fetch('https://your-backend.onrender.com/api/menus')
  .then(res => res.json())
  .then(data => console.log('API 응답:', data))
  .catch(err => console.error('API 오류:', err));
```

### 백엔드 로그 확인
Render 대시보드의 Logs 탭에서:
- CORS 관련 메시지 확인
- API 요청 로그 확인
- 에러 메시지 확인

