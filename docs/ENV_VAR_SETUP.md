# 환경 변수 설정 가이드

## 문제: 프런트엔드가 localhost에서 데이터를 가져오려고 함

프로덕션 환경에서도 `http://localhost:3000/api`를 사용하려고 하는 경우, 환경 변수가 제대로 설정되지 않은 것입니다.

## 해결 방법

### Render Static Site 환경 변수 설정

1. **Render 대시보드 접속**
   - https://dashboard.render.com

2. **프런트엔드 Static Site 선택**
   - 좌측 메뉴에서 Static Site 선택

3. **Environment Variables 섹션으로 이동**
   - Settings 탭 클릭
   - Environment Variables 섹션 찾기

4. **환경 변수 추가**
   - "Add Environment Variable" 클릭
   - 다음 정보 입력:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://order-app-backend-8jtr.onrender.com/api`
     - **참고**: 환경 변수를 설정하지 않아도 기본값으로 위 URL이 사용됩니다.

5. **재배포**
   - 환경 변수 저장 후 자동으로 재배포 시작
   - 또는 "Manual Deploy" → "Deploy latest commit" 클릭

## 중요 사항

### ✅ 올바른 설정

```
Key: VITE_API_URL
Value: https://cozy-coffee-backend.onrender.com/api
```

**포함해야 할 것:**
- ✅ 프로토콜 (`https://`)
- ✅ 백엔드 도메인 (`cozy-coffee-backend.onrender.com`)
- ✅ API 경로 (`/api`)

### ❌ 잘못된 설정

```
❌ VITE_API_URL=http://localhost:3000/api
❌ VITE_API_URL=https://cozy-coffee-backend.onrender.com  (경로 없음)
❌ VITE_API_URL=cozy-coffee-backend.onrender.com/api  (프로토콜 없음)
❌ API_URL=https://cozy-coffee-backend.onrender.com/api  (VITE_ 접두사 없음)
```

## 확인 방법

### 1. 브라우저 콘솔 확인

배포 후 브라우저 개발자 도구(F12) → Console 탭에서 확인:

```
🔧 API Base URL: https://cozy-coffee-backend.onrender.com/api
🔧 Environment: production
🔧 VITE_API_URL (env): https://cozy-coffee-backend.onrender.com/api
```

**문제가 있는 경우:**
```
🔧 API Base URL: http://localhost:3000/api
🔧 Environment: production
🔧 VITE_API_URL (env): undefined
```

### 2. Network 탭 확인

브라우저 개발자 도구 → Network 탭:
- API 요청 URL이 올바른지 확인
- `https://your-backend.onrender.com/api/menus` 형식이어야 함

## Vite 환경 변수 특징

### 빌드 시점 주입
- Vite는 **빌드 시점**에 환경 변수를 코드에 주입합니다
- 런타임에 변경할 수 없습니다
- 환경 변수를 변경하면 **반드시 재배포**해야 합니다

### 환경 변수 이름 규칙
- 반드시 `VITE_`로 시작해야 합니다
- 예: `VITE_API_URL` ✅
- 예: `API_URL` ❌ (Vite가 인식하지 않음)

## 문제 해결 체크리스트

- [ ] Render 대시보드에서 Static Site 선택
- [ ] Settings → Environment Variables 확인
- [ ] `VITE_API_URL` 키가 있는지 확인
- [ ] 값이 올바른 형식인지 확인 (`https://...onrender.com/api`)
- [ ] localhost가 아닌지 확인
- [ ] 환경 변수 저장 후 재배포 확인
- [ ] 브라우저 콘솔에서 API URL 확인
- [ ] Network 탭에서 실제 요청 URL 확인

## 추가 디버깅

### 환경 변수가 설정되지 않은 경우

브라우저 콘솔에 다음 메시지가 표시됩니다:
```
❌ 프로덕션 환경에서 VITE_API_URL이 설정되지 않았습니다!
❌ Render 대시보드에서 Environment Variables에 VITE_API_URL을 설정해주세요.
```

### localhost를 사용하려고 하는 경우

브라우저 콘솔에 다음 메시지가 표시됩니다:
```
❌ 프로덕션 환경에서 localhost를 사용할 수 없습니다!
❌ VITE_API_URL을 프로덕션 백엔드 URL로 설정해주세요.
```

## 참고

- 환경 변수는 빌드 시점에 주입되므로, 변경 후 반드시 재배포해야 합니다
- Render는 환경 변수 변경 시 자동으로 재배포를 시작합니다
- 재배포는 보통 2-5분 정도 소요됩니다

