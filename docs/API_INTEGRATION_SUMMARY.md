# 백엔드 API 연동 완료 요약

## 수정된 파일 목록

### 1. 새로 생성된 파일
- `ui/src/utils/api.js` - API 요청 유틸리티 함수

### 2. 수정된 파일
- `ui/src/context/InventoryContext.jsx` - API 호출로 메뉴/재고 데이터 가져오기
- `ui/src/context/OrderContext.jsx` - API 호출로 주문 생성/조회/상태 업데이트
- `ui/src/pages/OrderPage.jsx` - Context에서 menus 사용, 로딩/에러 상태 처리
- `ui/src/components/MenuCard.jsx` - 메뉴의 options를 API 데이터에서 가져오기
- `ui/src/components/Inventory.jsx` - 로딩/에러 상태 처리 추가
- `ui/src/components/OrderList.jsx` - 로딩/에러 상태 처리 추가
- `ui/src/pages/OrderPage.css` - 로딩/에러/빈 상태 스타일 추가
- `ui/src/components/Inventory.css` - 로딩/에러/빈 상태 스타일 추가
- `ui/src/components/OrderList.css` - 로딩/에러 상태 스타일 추가

## 주요 변경사항

### 1. API 유틸리티 (`ui/src/utils/api.js`)
- 환경 변수 `VITE_API_URL` 사용 (기본값: `http://localhost:3000/api`)
- `menuAPI`: 메뉴 조회, 재고 업데이트
- `orderAPI`: 주문 생성, 조회, 상태 업데이트
- 에러 처리 및 로깅 포함

### 2. InventoryContext
- `useEffect`로 초기 메뉴 데이터 로드
- `menus` 상태 추가 (메뉴 목록)
- `loading`, `error` 상태 추가
- `updateInventory`: API 호출로 재고 업데이트
- `decreaseInventoryForOrder`: 주문 후 재고 새로고침

### 3. OrderContext
- `useEffect`로 초기 주문 목록 로드
- `loading`, `error` 상태 추가
- `addOrder`: API 호출로 주문 생성 후 목록 새로고침
- `updateOrderStatus`: API 호출로 주문 상태 업데이트

### 4. OrderPage
- `menuItems` import 제거
- Context에서 `menus` 가져오기
- 로딩/에러/빈 상태 UI 추가
- 주문 생성 시 API 형식에 맞게 데이터 변환

### 5. MenuCard
- `options` import 제거
- `menu.options` 사용 (API에서 가져온 데이터)

### 6. Inventory & OrderList
- 로딩/에러 상태 UI 추가
- 빈 상태 처리 개선

## 환경 변수 설정

### 개발 환경
`.env` 파일 생성 (선택사항):
```env
VITE_API_URL=http://localhost:3000/api
```

### 프로덕션 환경 (Render)
Render 대시보드의 Environment Variables에서:
- **Key**: `VITE_API_URL`
- **Value**: `https://your-backend.onrender.com/api`

## API 엔드포인트

### 메뉴
- `GET /api/menus` - 메뉴 목록 조회
- `PATCH /api/menus/:menuId/stock` - 재고 업데이트

### 주문
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/:orderId` - 주문 상세 조회
- `PATCH /api/orders/:orderId/status` - 주문 상태 업데이트

## 데이터 형식

### 메뉴 응답
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "description": "...",
      "price": 4000,
      "image": "...",
      "stock": 10,
      "options": [
        { "id": 1, "name": "샷 추가", "price": 500 }
      ]
    }
  ]
}
```

### 주문 생성 요청
```json
{
  "items": [
    {
      "menuId": 1,
      "quantity": 2,
      "options": [
        { "id": 1, "name": "샷 추가", "price": 500 }
      ]
    }
  ],
  "totalPrice": 9000
}
```

### 주문 응답
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderTime": "2024-01-01T12:00:00Z",
      "status": "PENDING",
      "totalPrice": 9000,
      "items": [
        {
          "id": 1,
          "menuId": 1,
          "menuName": "아메리카노(ICE)",
          "quantity": 2,
          "unitPrice": 4500,
          "options": [...]
        }
      ]
    }
  ]
}
```

## 테스트 방법

1. 백엔드 서버 실행:
   ```bash
   cd server
   npm run dev
   ```

2. 프런트엔드 개발 서버 실행:
   ```bash
   cd ui
   npm run dev
   ```

3. 브라우저에서 확인:
   - 메뉴 목록이 표시되는지 확인
   - 주문 기능이 작동하는지 확인
   - 관리자 페이지에서 재고/주문 관리가 작동하는지 확인

## 배포 전 확인사항

1. ✅ 환경 변수 `VITE_API_URL` 설정 확인
2. ✅ 백엔드 CORS 설정 확인 (`server/server.js`)
3. ✅ 데이터베이스 초기화 확인 (`npm run db:init`)
4. ✅ API 엔드포인트 테스트
5. ✅ 에러 처리 확인

## 문제 해결

### API 연결 실패
- 백엔드 서버가 실행 중인지 확인
- `VITE_API_URL` 환경 변수 확인
- CORS 설정 확인
- 브라우저 개발자 도구의 Network 탭 확인

### 데이터가 표시되지 않음
- 브라우저 콘솔에서 에러 메시지 확인
- API 응답 형식 확인
- 데이터베이스에 데이터가 있는지 확인

