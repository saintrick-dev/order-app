# 프런트엔드 Render 배포 요약

## 빠른 시작 가이드

### 1. Render Static Site 생성

1. Render 대시보드 접속: https://dashboard.render.com
2. "New +" → "Static Site" 선택
3. GitHub 저장소 연결

### 2. 빌드 설정

다음 설정을 Render 대시보드에 입력:

| 설정 항목 | 값 |
|---------|-----|
| **Name** | `cozy-coffee-frontend` (또는 원하는 이름) |
| **Branch** | `main` (또는 기본 브랜치) |
| **Root Directory** | `ui` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 3. 환경 변수 설정

Render 대시보드의 **Environment Variables** 섹션에서:

- **Key**: `VITE_API_URL`
- **Value**: `https://your-backend.onrender.com/api`

**중요**: 
- 백엔드가 배포된 후 실제 URL로 변경하세요
- 환경 변수 이름은 반드시 `VITE_`로 시작해야 합니다

### 4. 배포 확인

1. 배포가 완료되면 Render가 제공하는 URL로 접속
2. 브라우저 개발자 도구(F12) → Network 탭에서 API 요청 확인
3. 콘솔에서 오류 메시지 확인

---

## 코드 수정 사항

### 현재 상태 확인

현재 프런트엔드 코드는 로컬 데이터를 사용하고 있습니다. 
백엔드 API와 연동하려면 다음 파일들을 확인/수정해야 합니다:

1. **API 유틸리티 파일** (`ui/src/utils/api.js`)
   - API 요청 함수가 있는지 확인
   - `VITE_API_URL` 환경 변수를 사용하는지 확인

2. **Context 파일들**
   - `ui/src/context/InventoryContext.jsx`: API에서 메뉴/재고 데이터 가져오기
   - `ui/src/context/OrderContext.jsx`: API로 주문 생성/조회

3. **페이지 컴포넌트**
   - `ui/src/pages/OrderPage.jsx`: API에서 메뉴 데이터 표시
   - `ui/src/pages/AdminPage.jsx`: API에서 주문/재고 데이터 표시

### API 연동이 필요한 경우

만약 현재 코드가 API를 사용하지 않는다면, 다음을 수행해야 합니다:

1. `ui/src/utils/api.js` 파일 생성
2. Context 파일들을 API 호출로 수정
3. 환경 변수 `VITE_API_URL` 사용

자세한 내용은 `docs/RENDER_DEPLOY.md`를 참고하세요.

---

## 문제 해결

### 빌드 실패
- Node.js 버전 확인 (Render는 기본적으로 최신 LTS 사용)
- `ui/package.json`의 빌드 스크립트 확인
- 빌드 로그에서 구체적인 오류 메시지 확인

### API 연결 실패
- `VITE_API_URL` 환경 변수가 올바르게 설정되었는지 확인
- 백엔드 서버가 실행 중인지 확인
- CORS 설정 확인 (`server/server.js`의 `corsOptions`)
- 브라우저 개발자 도구의 Network 탭에서 요청/응답 확인

### 빈 화면 또는 404 오류
- `Publish Directory`가 `dist`로 설정되었는지 확인
- Vite의 `base` 설정 확인 (`ui/vite.config.js`)

---

## 배포 순서 (전체)

1. ✅ PostgreSQL 데이터베이스 배포
2. ✅ 백엔드 Web Service 배포
   - Root Directory: `server`
   - Start Command: `npm start`
3. ⏳ 프런트엔드 Static Site 배포
   - Root Directory: `ui`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment Variable: `VITE_API_URL`

---

## 참고

- Render Static Site는 무료 플랜에서도 사용 가능
- 15분간 비활성화되면 자동으로 sleep됨
- 첫 방문 시 약간의 지연이 있을 수 있음 (wake-up 시간)

