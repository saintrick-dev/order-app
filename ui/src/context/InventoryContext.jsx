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
    orderItems.forEach((item) => {
      const inventoryItem = getInventoryByMenuId(item.menuId);
      if (inventoryItem) {
        updateInventory(item.menuId, -item.quantity);
      }
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

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        updateInventory,
        getInventoryStatus,
        getInventoryByMenuId,
        decreaseInventoryForOrder,
        canOrder,
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
