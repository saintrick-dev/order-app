import { createContext, useContext, useState } from 'react';
import { menuItems } from '../data/menuData';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState(() => {
    // 초기 재고를 10개로 설정
    return menuItems.map((menu) => ({
      menuId: menu.id,
      menuName: menu.name,
      quantity: 10,
    }));
  });

  const updateInventory = (menuId, delta) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.menuId === menuId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const getInventoryStatus = (quantity) => {
    if (quantity === 0) return { text: '품절', color: '#dc2626' };
    if (quantity < 5) return { text: '주의', color: '#f59e0b' };
    return { text: '정상', color: '#10b981' };
  };

  const getInventoryByMenuId = (menuId) => {
    return inventory.find((item) => item.menuId === menuId);
  };

  const decreaseInventoryForOrder = (orderItems) => {
    // 한 번에 모든 재고를 업데이트하여 리렌더링 최소화
    setInventory((prev) => {
      const updates = new Map();
      orderItems.forEach((item) => {
        const currentQty = updates.get(item.menuId) || 
          prev.find((inv) => inv.menuId === item.menuId)?.quantity || 0;
        updates.set(item.menuId, Math.max(0, currentQty - item.quantity));
      });

      return prev.map((item) => {
        if (updates.has(item.menuId)) {
          return { ...item, quantity: updates.get(item.menuId) };
        }
        return item;
      });
    });
  };

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
