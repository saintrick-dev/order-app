import { useOrders } from '../context/OrderContext';
import './OrderList.css';

function OrderList() {
  const { orders, updateOrderStatus, loading, error } = useOrders();

  const formatDate = (date) => {
    // 백엔드에서 받은 날짜 문자열을 Date 객체로 변환
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '날짜 없음';
    }
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  const formatOrderItems = (items) => {
    return items
      .map((item) => {
        const options = item.options && item.options.length > 0
          ? ` (${item.options.map((opt) => opt.name).join(', ')})`
          : '';
        return `${item.menuName}${options} x ${item.quantity}`;
      })
      .join(', ');
  };

  const getStatusButton = (order) => {
    if (order.status === 'PENDING') {
      return (
        <button
          className="order-list__status-btn order-list__status-btn--primary"
          onClick={() => updateOrderStatus(order.id, 'PREPARING')}
          aria-label={`주문 #${order.id} 제조 시작`}
        >
          제조 시작
        </button>
      );
    } else if (order.status === 'PREPARING') {
      return (
        <button
          className="order-list__status-btn order-list__status-btn--secondary"
          onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
          aria-label={`주문 #${order.id} 제조 완료`}
        >
          제조 완료
        </button>
      );
    } else {
      return (
        <span className="order-list__status-completed" aria-label="제조 완료">제조 완료</span>
      );
    }
  };

  if (loading) {
    return (
      <div className="order-list">
        <h2 className="order-list__title">주문 현황</h2>
        <div className="order-list__loading">주문 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-list">
        <h2 className="order-list__title">주문 현황</h2>
        <div className="order-list__error">
          <p>주문 정보를 불러올 수 없습니다.</p>
          <p className="order-list__error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-list">
      <h2 className="order-list__title">주문 현황</h2>
      {orders.length === 0 ? (
        <p className="order-list__empty">주문이 없습니다.</p>
      ) : (
        <div className="order-list__items" role="list">
          {orders.map((order) => (
            <div key={order.id} className="order-list__item" role="listitem">
              <div className="order-list__item-info">
                <div className="order-list__time">
                  {formatDate(order.orderTime || order.order_time)}
                </div>
                <div className="order-list__content">
                  {formatOrderItems(order.items)}
                </div>
                <div className="order-list__price">
                  {order.totalPrice.toLocaleString()}원
                </div>
              </div>
              <div className="order-list__item-action">
                {getStatusButton(order)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderList;
