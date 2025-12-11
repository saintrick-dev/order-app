# 프런트엔드 Render 배포 가이드

## 현재 상태 분석

### ✅ 배포 준비 완료된 부분
- Vite 빌드 설정 완료 (`vite.config.js`)
- 빌드 스크립트 설정 완료 (`package.json`)
- React 앱 구조 완성

### ⚠️ 주의사항
현재 프런트엔드는 **로컬 데이터**를 사용하고 있습니다:
- `ui/src/data/menuData.js`에서 메뉴 데이터를 가져옴
- API 호출 코드가 없음
- 백엔드와 연동되지 않음

**배포는 가능하지만**, 백엔드 API와 연동하려면 코드 수정이 필요합니다.

---

## 배포 옵션

### 옵션 1: 현재 상태로 배포 (로컬 데이터 사용)
- 백엔드 없이도 작동
- 메뉴는 하드코딩된 데이터 사용
- 주문/재고는 브라우저 새로고침 시 초기화됨

### 옵션 2: 백엔드 API 연동 후 배포 (권장)
- 백엔드와 완전히 연동
- 데이터베이스에서 메뉴/주문/재고 관리
- 프로덕션 환경에 적합

---

## 옵션 2: 백엔드 API 연동 코드 수정

### 1. API 유틸리티 파일 생성

`ui/src/utils/api.js` 파일을 생성합니다:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = 'API 요청 실패';
      try {
        const data = await response.json();
        errorMessage = data.error?.message || `서버 오류 (${response.status})`;
      } catch (e) {
        errorMessage = `서버 오류 (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
    throw error;
  }
}

export const menuAPI = {
  getMenus: () => apiRequest('/menus'),
  updateStock: (menuId, quantity) =>
    apiRequest(`/menus/${menuId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
};

export const orderAPI = {
  createOrder: (orderData) =>
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  getOrders: () => apiRequest('/orders'),
  getOrderById: (orderId) => apiRequest(`/orders/${orderId}`),
  updateOrderStatus: (orderId, status) =>
    apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
```

### 2. InventoryContext 수정

`ui/src/context/InventoryContext.jsx`를 API 호출로 수정:

```javascript
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { menuAPI } from '../utils/api';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 메뉴 및 재고 데이터 로드
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await menuAPI.getMenus();
        
        if (response.success && response.data) {
          const menuData = response.data;
          setMenus(menuData);
          
          // 재고 데이터 생성
          const inventoryData = menuData.map((menu) => ({
            menuId: menu.id,
            menuName: menu.name,
            quantity: menu.stock || 0,
          }));
          setInventory(inventoryData);
        }
      } catch (err) {
        setError(err.message);
        console.error('메뉴 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const updateInventory = useCallback(async (menuId, delta) => {
    try {
      const inventoryItem = inventory.find((item) => item.menuId === menuId);
      if (!inventoryItem) return;

      const newQuantity = Math.max(0, inventoryItem.quantity + delta);
      const response = await menuAPI.updateStock(menuId, newQuantity);
      
      if (response.success) {
        setInventory((prev) =>
          prev.map((item) =>
            item.menuId === menuId
              ? { ...item, quantity: response.data.stock }
              : item
          )
        );
        setMenus((prev) =>
          prev.map((menu) =>
            menu.id === menuId
              ? { ...menu, stock: response.data.stock }
              : menu
          )
        );
      }
    } catch (err) {
      console.error('재고 업데이트 오류:', err);
      throw err;
    }
  }, [inventory]);

  const getInventoryStatus = (quantity) => {
    if (quantity === 0) return { text: '품절', color: '#dc2626' };
    if (quantity < 5) return { text: '주의', color: '#f59e0b' };
    return { text: '정상', color: '#10b981' };
  };

  const getInventoryByMenuId = (menuId) => {
    return inventory.find((item) => item.menuId === menuId);
  };

  const decreaseInventoryForOrder = useCallback(async (orderItems) => {
    // 주문 시 재고 감소는 백엔드에서 처리되므로, 메뉴를 다시 로드
    try {
      const response = await menuAPI.getMenus();
      if (response.success && response.data) {
        const inventoryData = response.data.map((menu) => ({
          menuId: menu.id,
          menuName: menu.name,
          quantity: menu.stock || 0,
        }));
        setInventory(inventoryData);
      }
    } catch (err) {
      console.error('재고 새로고침 오류:', err);
    }
  }, []);

  const canOrder = (cartItems) => {
    for (const item of cartItems) {
      const inventoryItem = getInventoryByMenuId(item.menuId);
      if (!inventoryItem || inventoryItem.quantity < item.quantity) {
        return false;
      }
    }
    return true;
  };

  const canAddToCart = (menuId, quantity = 1) => {
    const inventoryItem = getInventoryByMenuId(menuId);
    return inventoryItem && inventoryItem.quantity >= quantity;
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        menus,
        loading,
        error,
        updateInventory,
        getInventoryStatus,
        getInventoryByMenuId,
        decreaseInventoryForOrder,
        canOrder,
        canAddToCart,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
}
```

### 3. OrderContext 수정

`ui/src/context/OrderContext.jsx`를 API 호출로 수정:

```javascript
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { orderAPI } from '../utils/api';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 주문 목록 로드
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await orderAPI.getOrders();
        
        if (response.success && response.data) {
          setOrders(response.data);
        }
      } catch (err) {
        setError(err.message);
        console.error('주문 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const addOrder = useCallback(async (orderData) => {
    try {
      const response = await orderAPI.createOrder(orderData);
      
      if (response.success) {
        setOrders((prev) => [response.data, ...prev]);
        return response.data;
      }
    } catch (err) {
      console.error('주문 생성 오류:', err);
      throw err;
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      const response = await orderAPI.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (err) {
      console.error('주문 상태 업데이트 오류:', err);
      throw err;
    }
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'PENDING').length;
    const preparing = orders.filter((o) => o.status === 'PREPARING').length;
    const completed = orders.filter((o) => o.status === 'COMPLETED').length;
    return { total, pending, preparing, completed };
  }, [orders]);

  const getOrderStats = useCallback(() => stats, [stats]);

  const value = useMemo(() => ({
    orders,
    loading,
    error,
    addOrder,
    updateOrderStatus,
    getOrderStats,
  }), [orders, loading, error, addOrder, updateOrderStatus, getOrderStats]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
}
```

### 4. OrderPage 수정

`ui/src/pages/OrderPage.jsx`에서 `menus`를 Context에서 가져오도록 수정:

```javascript
// ... existing code ...
import { useInventory } from '../context/InventoryContext';
// menuItems import 제거

function OrderPage() {
  // ... existing code ...
  const { menus, canOrder, canAddToCart, decreaseInventoryForOrder, loading, error } = useInventory();
  
  // ... existing code ...
  
  if (loading) {
    return <div>메뉴를 불러오는 중...</div>;
  }
  
  if (error) {
    return <div>오류: {error}</div>;
  }
  
  return (
    <div className="order-page">
      <div className="order-page__menu-grid">
        {menus.map((menu) => (
          <MenuCard key={menu.id} menu={menu} onAddToCart={handleAddToCart} />
        ))}
      </div>
      {/* ... existing code ... */}
    </div>
  );
}
```

---

## Render Static Site 배포 설정

### 1. Render 대시보드 설정

1. Render 대시보드 접속: https://dashboard.render.com
2. "New +" → "Static Site" 선택
3. GitHub 저장소 연결

### 2. 빌드 설정

| 설정 항목 | 값 |
|---------|-----|
| **Name** | `cozy-coffee-frontend` |
| **Branch** | `main` (또는 기본 브랜치) |
| **Root Directory** | `ui` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 3. 환경 변수 설정

Render 대시보드의 **Environment Variables** 섹션에서:

- **Key**: `VITE_API_URL`
- **Value**: 백엔드 API URL (예: `https://your-backend.onrender.com/api`)

**중요**: 
- 환경 변수 이름은 반드시 `VITE_`로 시작해야 합니다
- 백엔드가 배포된 후 실제 URL로 변경하세요
- 값에는 프로토콜(`https://`)을 포함해야 합니다

### 4. 배포 확인

1. 배포가 완료되면 Render가 제공하는 URL로 접속
2. 브라우저 개발자 도구(F12) → Network 탭에서 API 요청 확인
3. 콘솔에서 오류 메시지 확인

---

## 배포 순서 (전체)

1. ✅ PostgreSQL 데이터베이스 배포
2. ✅ 백엔드 Web Service 배포
3. ⏳ 프런트엔드 Static Site 배포
   - 코드 수정 (API 연동)
   - Render 설정
   - 환경 변수 설정

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

## 참고

- Render Static Site는 무료 플랜에서도 사용 가능
- 15분간 비활성화되면 자동으로 sleep됨
- 첫 방문 시 약간의 지연이 있을 수 있음 (wake-up 시간)

