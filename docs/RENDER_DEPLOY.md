# Render.com 배포 가이드

## 백엔드 배포 오류 해결

### 문제
```
Error: Cannot find module '/opt/render/project/src/server/index.js'
```

### 원인
Render가 잘못된 경로에서 서버 파일을 찾고 있습니다. Render는 기본적으로 `/opt/render/project/src/` 경로에서 `index.js`를 찾으려고 합니다.

### 해결 방법

#### 방법 1: Root Directory를 `server`로 설정 (권장)

Render 대시보드에서 Web Service 설정:

1. **Root Directory**: `server` 입력
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`

이렇게 설정하면 Render는 `/opt/render/project/src/server/` 경로에서 `package.json`을 찾고, `npm start`가 `server.js`를 실행합니다.

#### 방법 2: Root Directory를 비우고 경로 지정

1. **Root Directory**: (비워두기 - 프로젝트 루트)
2. **Build Command**: `cd server && npm install`
3. **Start Command**: `cd server && npm start`

#### 방법 3: package.json의 start 스크립트 수정 (비권장)

만약 위 방법이 작동하지 않는다면, `server/package.json`의 start 스크립트를 절대 경로로 수정할 수 있지만, 방법 1 또는 2를 권장합니다.

#### 환경 변수 설정
Render 대시보드의 Environment Variables에 다음을 추가:
- `PORT`: (자동 설정됨, 수정 불필요)
- `DATABASE_URL`: Render PostgreSQL의 Internal Database URL
- `NODE_ENV`: `production`
- `FRONTEND_URL`: 프런트엔드 배포 URL (예: `https://your-frontend.onrender.com`)

---

## 프런트엔드 배포

### 1. 코드 수정 사항

#### 1.1 환경 변수 설정
**중요**: Render Static Site는 `.env` 파일을 사용하지 않습니다. 대신 Render 대시보드의 Environment Variables에서 설정해야 합니다.

프런트엔드 코드에서 API URL을 사용하는 경우, `import.meta.env.VITE_API_URL`을 사용하도록 되어 있어야 합니다.

현재 코드가 API를 사용하지 않는 경우, 다음을 확인하세요:
- `ui/src/utils/api.js` 파일이 있는지 확인
- API 호출 시 `import.meta.env.VITE_API_URL || 'http://localhost:3000/api'` 형식으로 사용

#### 1.2 Vite 설정 확인
`ui/vite.config.js`가 올바르게 설정되어 있는지 확인 (이미 설정됨)

현재 설정:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

추가 설정이 필요한 경우 (예: base 경로):
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/', // 또는 '/your-app-name/' (서브 경로 배포 시)
})
```

### 2. Render Static Site 배포 설정

#### 2.1 새 Static Site 생성
1. Render 대시보드에서 "New +" → "Static Site" 선택
2. GitHub 저장소 연결

#### 2.2 빌드 설정
- **Name**: `cozy-coffee-frontend` (또는 원하는 이름)
- **Branch**: `main` (또는 기본 브랜치)
- **Root Directory**: `ui`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

#### 2.3 환경 변수 설정
Render 대시보드의 Environment Variables 섹션에서:
- **Key**: `VITE_API_URL`
- **Value**: 백엔드 API URL (예: `https://your-backend.onrender.com/api`)

**중요**: 
- 환경 변수 이름은 반드시 `VITE_`로 시작해야 Vite가 빌드 시 포함합니다.
- 값에는 프로토콜(`https://`)을 포함해야 합니다.
- 마지막에 `/api`를 포함하세요 (백엔드의 API 라우트 경로).

### 3. 배포 후 확인 사항

1. **빌드 로그 확인**: 빌드가 성공적으로 완료되었는지 확인
2. **환경 변수 확인**: `VITE_API_URL`이 올바르게 설정되었는지 확인
3. **API 연결 확인**: 브라우저 개발자 도구에서 네트워크 요청 확인

### 4. 문제 해결

#### 빌드 실패 시
- `ui/package.json`의 빌드 스크립트 확인
- Node.js 버전 확인 (Render는 기본적으로 최신 LTS 사용)

#### API 연결 실패 시
- `VITE_API_URL` 환경 변수 확인
- CORS 설정 확인 (`server/server.js`의 `corsOptions`)
- 백엔드 서버가 실행 중인지 확인

---

## 배포 순서

1. **PostgreSQL 데이터베이스 배포** (이미 완료)
2. **백엔드 Web Service 배포**
   - Root Directory: `server` 또는 비워두기
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
3. **프런트엔드 Static Site 배포**
   - Root Directory: `ui`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

---

## 참고 사항

- Render의 Static Site는 무료 플랜에서도 사용 가능하지만, 15분간 비활성화되면 자동으로 sleep됩니다.
- Web Service도 무료 플랜에서 사용 가능하지만, 동일하게 sleep됩니다.
- 프로덕션 환경에서는 환경 변수를 통해 API URL을 동적으로 설정하세요.

