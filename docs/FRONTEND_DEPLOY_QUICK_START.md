# 프런트엔드 Render 배포 빠른 시작 가이드

## 현재 상태

✅ **배포 가능**: 현재 코드는 로컬 데이터를 사용하므로 바로 배포 가능합니다.
⚠️ **제한사항**: 백엔드 API와 연동되지 않아 데이터가 영구 저장되지 않습니다.

## 배포 과정 (현재 코드로)

### 1단계: Render Static Site 생성

1. Render 대시보드 접속: https://dashboard.render.com
2. "New +" → "Static Site" 선택
3. GitHub 저장소 연결

### 2단계: 빌드 설정

| 설정 항목 | 값 |
|---------|-----|
| **Name** | `cozy-coffee-frontend` |
| **Branch** | `main` |
| **Root Directory** | `ui` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 3단계: 배포

"Create Static Site" 버튼 클릭 → 배포 완료!

**환경 변수 불필요**: 현재는 로컬 데이터를 사용하므로 환경 변수 설정이 필요 없습니다.

---

## 백엔드 API 연동이 필요한 경우

백엔드와 연동하려면 다음 파일들을 수정해야 합니다:

1. `ui/src/utils/api.js` - API 유틸리티 생성
2. `ui/src/context/InventoryContext.jsx` - API 호출로 수정
3. `ui/src/context/OrderContext.jsx` - API 호출로 수정
4. `ui/src/pages/OrderPage.jsx` - Context에서 메뉴 가져오기

자세한 내용은 `docs/FRONTEND_DEPLOY_GUIDE.md`를 참고하세요.

### API 연동 후 환경 변수 설정

Render 대시보드의 **Environment Variables**에서:
- **Key**: `VITE_API_URL`
- **Value**: `https://your-backend.onrender.com/api`

---

## 배포 확인

1. 배포 완료 후 Render가 제공하는 URL로 접속
2. 메뉴가 정상적으로 표시되는지 확인
3. 주문 기능이 작동하는지 확인

---

## 문제 해결

### 빌드 실패
- `Root Directory`가 `ui`로 설정되었는지 확인
- `Build Command`가 올바른지 확인
- 빌드 로그에서 오류 메시지 확인

### 빈 화면
- `Publish Directory`가 `dist`로 설정되었는지 확인
- 브라우저 콘솔에서 오류 메시지 확인

