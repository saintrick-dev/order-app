# COZY Coffee 백엔드 서버

## 설치 방법

```bash
npm install
```

## 환경 변수 설정

`.env` 파일에 데이터베이스 정보를 입력하세요.

```bash
# .env 파일이 없으면 생성하고 아래 내용을 입력하세요
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cozy_coffee
DB_USER=postgres
DB_PASSWORD=your_password
NODE_ENV=development
```

## 데이터베이스 설정

### 1. 데이터베이스 생성
```bash
npm run db:create
```

### 2. 스키마 및 초기 데이터 생성
```bash
npm run db:init
```

### 3. 데이터베이스 연결 테스트
```bash
npm run db:test
```

## 실행 방법

### 개발 모드 (nodemon 사용)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

## API 엔드포인트

- `GET /` - 서버 정보
- `GET /health` - 헬스 체크

## 데이터베이스

PostgreSQL을 사용합니다. 데이터베이스 스키마는 `docs/PRD.md`의 백엔드 개발 섹션을 참고하세요.

### 생성된 테이블
- `menus` - 메뉴 정보
- `options` - 옵션 정보
- `orders` - 주문 정보
- `order_items` - 주문 항목 정보
