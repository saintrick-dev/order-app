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
        console.log('📋 주문 목록 로드 시작...');
        const response = await orderAPI.getOrders();
        
        if (response.success && response.data) {
          console.log('✅ 주문 목록 로드 성공:', response.data.length, '개');
          setOrders(response.data);
        } else {
          throw new Error('주문 데이터 형식이 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('❌ 주문 로드 오류:', err);
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

    fetchOrders();
  }, []);

  const addOrder = useCallback(async (orderData) => {
    try {
      console.log('📝 주문 생성 시작...', orderData);
      const response = await orderAPI.createOrder(orderData);
      
      if (response.success) {
        console.log('✅ 주문 생성 성공:', response.data);
        
        // 주문 생성 후 전체 주문 목록을 다시 불러와서 최신 상태 유지
        // (백엔드에서 items가 포함된 완전한 주문 정보를 가져오기 위해)
        const ordersResponse = await orderAPI.getOrders();
        if (ordersResponse.success && ordersResponse.data) {
          setOrders(ordersResponse.data);
        } else {
          // 주문 목록을 불러오지 못해도 생성된 주문은 추가
          setOrders((prev) => [response.data, ...prev]);
        }
        
        return response.data;
      } else {
        throw new Error('주문 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 주문 생성 오류:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      console.log(`🔄 주문 상태 업데이트: 주문 ID ${orderId}, 상태 → ${newStatus}`);
      const response = await orderAPI.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        console.log('✅ 주문 상태 업데이트 성공');
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        throw new Error('주문 상태 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 주문 상태 업데이트 오류:', err);
      setError(err.message);
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
