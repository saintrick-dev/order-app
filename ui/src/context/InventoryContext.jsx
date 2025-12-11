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
        console.log('📋 메뉴 데이터 로드 시작...');
        const response = await menuAPI.getMenus();
        
        if (response.success && response.data) {
          const menuData = response.data;
          console.log('✅ 메뉴 데이터 로드 성공:', menuData.length, '개');
          setMenus(menuData);
          
          // 재고 데이터 생성
          const inventoryData = menuData.map((menu) => ({
            menuId: menu.id,
            menuName: menu.name,
            quantity: menu.stock || 0,
          }));
          setInventory(inventoryData);
          console.log('✅ 재고 데이터 설정 완료:', inventoryData.length, '개');
        } else {
          throw new Error('메뉴 데이터 형식이 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('❌ 메뉴 로드 오류:', err);
        // 에러 메시지를 사용자 친화적으로 변환
        let errorMessage = err.message;
        if (err.message.includes('서버에 연결할 수 없습니다')) {
          errorMessage = '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const updateInventory = useCallback(async (menuId, delta) => {
    try {
      const inventoryItem = inventory.find((item) => item.menuId === menuId);
      if (!inventoryItem) {
        console.warn('⚠️ 재고 항목을 찾을 수 없습니다:', menuId);
        return;
      }

      const newQuantity = Math.max(0, inventoryItem.quantity + delta);
      console.log(`📦 재고 업데이트: 메뉴 ID ${menuId}, ${inventoryItem.quantity} → ${newQuantity}`);
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
        console.log('✅ 재고 업데이트 성공');
      }
    } catch (err) {
      console.error('❌ 재고 업데이트 오류:', err);
      setError(err.message);
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
    // 주문 시 재고 감소는 백엔드에서 처리되므로, 메뉴를 다시 로드하여 최신 상태 반영
    try {
      console.log('🔄 주문 후 재고 새로고침 시작...');
      const response = await menuAPI.getMenus();
      if (response.success && response.data) {
        const inventoryData = response.data.map((menu) => ({
          menuId: menu.id,
          menuName: menu.name,
          quantity: menu.stock || 0,
        }));
        setInventory(inventoryData);
        setMenus(response.data);
        console.log('✅ 재고 새로고침 완료');
      }
    } catch (err) {
      console.error('❌ 재고 새로고침 오류:', err);
      // 오류가 발생해도 주문은 완료된 상태이므로 에러를 던지지 않음
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
