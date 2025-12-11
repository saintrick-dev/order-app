# 서버 연결 오류 해결 가이드

## 문제 증상

"서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요." 메시지가 주문하기와 재고현황 화면에 표시됨

## 원인 분석

1. **API URL 미설정**: `VITE_API_URL` 환경 변수가 설정되지 않음
2. **백엔드 서버 미실행**: 백엔드 서버가 실행되지 않았거나 접근 불가
3. **CORS 오류**: 백엔드 CORS 설정이 프런트엔드 URL을 허용하지 않음
4. **네트워크 오류**: 방화벽 또는 네트워크 문제

## 해결 방법

### 1. 환경 변수 확인

#### 개발 환경
로컬 개발 시에는 기본값(`http://localhost:3000/api`)이 사용됩니다.

#### 프로덕션 환경 (Render)
Render 대시보드에서 프런트엔드 Static Site의 **Environment Variables** 확인:

| Key | Value | 예시 |
|-----|-------|------|
| `VITE_API_URL` | 백엔드 API URL | `https://your-backend.onrender.com/api` |

**중요**: 
- 환경 변수 이름은 반드시 `VITE_`로 시작해야 합니다
- 값에는 프로토콜(`https://`)을 포함해야 합니다
- 마지막에 `/api`를 포함해야 합니다

### 2. 백엔드 서버 확인

#### Health Check
브라우저에서 직접 접속하여 확인:
```
https://your-backend.onrender.com/health
```

예상 응답:
```json
{
  "status": "OK",
  "database": "connected"
}
```

#### API 테스트
```
https://your-backend.onrender.com/api/menus
```

### 3. 브라우저 개발자 도구 확인

1. **Console 탭**:
   - `🔧 API Base URL: ...` 메시지 확인
   - 에러 메시지 확인
   - API 요청 로그 확인

2. **Network 탭**:
   - API 요청이 실패하는지 확인
   - CORS 오류가 있는지 확인
   - 응답 상태 코드 확인

### 4. 백엔드 CORS 설정 확인

Render 대시보드에서 백엔드 Web Service의 **Environment Variables** 확인:

| Key | Value | 예시 |
|-----|-------|------|
| `FRONTEND_URL` | 프런트엔드 URL | `https://your-frontend.onrender.com` |

### 5. 재배포

환경 변수를 변경한 경우:
1. **프런트엔드**: 환경 변수 변경 후 자동 재배포 (또는 수동 재배포)
2. **백엔드**: 환경 변수 변경 후 재배포

## 코드 개선 사항

### 1. 에러 메시지 개선
- 환경에 따른 다른 에러 메시지 표시
- API URL 정보 포함
- 사용자 친화적인 메시지

### 2. API URL 유효성 검사
- 환경 변수 미설정 감지
- 프로덕션 환경에서 localhost 사용 경고

### 3. 재시도 기능
- 에러 화면에 "새로고침" 버튼 추가
- 사용자가 쉽게 재시도 가능

## 디버깅 체크리스트

- [ ] 브라우저 콘솔에서 API Base URL 확인
- [ ] `VITE_API_URL` 환경 변수 설정 확인
- [ ] 백엔드 Health Check 접속 테스트
- [ ] 백엔드 API 엔드포인트 직접 접속 테스트
- [ ] Network 탭에서 API 요청 상태 확인
- [ ] CORS 오류 메시지 확인
- [ ] 백엔드 로그 확인 (Render 대시보드)

## 일반적인 해결 방법

### 문제: API URL이 localhost로 표시됨
**해결**: Render에서 `VITE_API_URL` 환경 변수를 설정하고 재배포

### 문제: CORS 오류
**해결**: 백엔드에서 `FRONTEND_URL` 환경 변수를 설정하고 재배포

### 문제: 백엔드 서버가 응답하지 않음
**해결**: 
1. Render 대시보드에서 백엔드 서비스 상태 확인
2. 백엔드 로그 확인
3. 데이터베이스 연결 확인

### 문제: 네트워크 오류
**해결**:
1. 인터넷 연결 확인
2. 방화벽 설정 확인
3. Render 서비스 상태 확인

## 추가 도움말

문제가 계속되면:
1. 브라우저 콘솔의 전체 에러 메시지 확인
2. Network 탭의 요청/응답 상세 정보 확인
3. Render 대시보드의 로그 확인
4. 환경 변수 설정 재확인

