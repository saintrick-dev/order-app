# 백엔드 배포 오류 해결 가이드

## 오류 메시지
```
Error: Cannot find module '/opt/render/project/src/server/index.js'
```

## 원인
Render는 기본적으로 프로젝트 루트에서 `index.js`를 찾으려고 합니다. 하지만 이 프로젝트는 `server` 폴더에 `server.js` 파일이 있습니다.

## 해결 방법

### ✅ 방법 1: Root Directory 설정 (권장)

Render 대시보드에서 Web Service 설정:

1. **Settings** 탭으로 이동
2. **Root Directory** 필드에 `server` 입력
3. **Build Command**: `npm install` (또는 비워두기)
4. **Start Command**: `npm start`

이렇게 설정하면:
- Render는 `/opt/render/project/src/server/` 경로에서 작업합니다
- `npm start`가 `server/package.json`의 `start` 스크립트를 실행합니다
- `start` 스크립트는 `node server.js`를 실행합니다

### ✅ 방법 2: 경로를 포함한 명령어 사용

Root Directory를 비워두고 (프로젝트 루트):

1. **Build Command**: `cd server && npm install`
2. **Start Command**: `cd server && npm start`

### ❌ 잘못된 설정 예시

다음 설정은 작동하지 않습니다:
- Root Directory: (비워두기)
- Start Command: `node server.js` ❌
  - 이유: 프로젝트 루트에서 `server.js`를 찾을 수 없음

## 확인 사항

### 1. package.json 확인
`server/package.json` 파일이 다음을 포함하는지 확인:

```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
```

### 2. 파일 구조 확인
프로젝트 구조가 다음과 같은지 확인:

```
order-app/
├── server/
│   ├── server.js      ← 메인 서버 파일
│   ├── package.json   ← npm 설정
│   ├── config/
│   ├── controllers/
│   └── routes/
└── ui/
```

### 3. 환경 변수 확인
Render 대시보드의 Environment Variables에 다음이 설정되어 있는지 확인:

- `DATABASE_URL`: PostgreSQL 연결 URL
- `NODE_ENV`: `production`
- `FRONTEND_URL`: 프런트엔드 URL (CORS용)
- `PORT`: (자동 설정, 수정 불필요)

## 배포 후 확인

1. **로그 확인**: Render 대시보드의 Logs 탭에서 서버 시작 메시지 확인
2. **Health Check**: `https://your-backend.onrender.com/health` 접속하여 서버 상태 확인
3. **API 테스트**: `https://your-backend.onrender.com/api/menus` 접속하여 메뉴 데이터 확인

## 추가 문제 해결

### 데이터베이스 연결 실패
- `DATABASE_URL` 환경 변수가 올바른지 확인
- Render PostgreSQL의 Internal Database URL 사용 (외부 URL이 아님)
- SSL 설정 확인 (`server/config/database.js`)

### 포트 오류
- `PORT` 환경 변수를 수정하지 마세요 (Render가 자동 설정)
- `server.js`에서 `process.env.PORT || 3000` 사용 확인

### 빌드 실패
- Node.js 버전 확인 (Render는 기본적으로 최신 LTS 사용)
- `package.json`의 의존성 확인
- 빌드 로그에서 구체적인 오류 메시지 확인

