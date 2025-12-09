import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [nextOrderId, setNextOrderId] = useState(1);

  const addOrder = (orderData) => {
    const newOrder = {
      id: nextOrderId,
      orderTime: new Date(),
      items: orderData.items,
      totalPrice: orderData.totalPrice,
      status: 'PENDING', // PENDING, PREPARING, COMPLETED
    };
    setOrders((prev) => [newOrder, ...prev]);
    setNextOrderId((prev) => prev + 1);
    return newOrder.id;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'PENDING').length;
    const preparing = orders.filter((o) => o.status === 'PREPARING').length;
    const completed = orders.filter((o) => o.status === 'COMPLETED').length;
    return { total, pending, preparing, completed };
  };

  return (
    <OrderContext.Provider
      value={{ orders, addOrder, updateOrderStatus, getOrderStats }}
    >
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

