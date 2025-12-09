import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [nextOrderId, setNextOrderId] = useState(1);

  const addOrder = useCallback((orderData) => {
    setOrders((prev) => {
      const newOrder = {
        id: nextOrderId,
        orderTime: new Date(),
        items: orderData.items,
        totalPrice: orderData.totalPrice,
        status: 'PENDING', // PENDING, PREPARING, COMPLETED
      };
      setNextOrderId((prevId) => prevId + 1);
      return [newOrder, ...prev];
    });
  }, [nextOrderId]);

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
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
    addOrder,
    updateOrderStatus,
    getOrderStats,
  }), [orders, addOrder, updateOrderStatus, getOrderStats]);

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
