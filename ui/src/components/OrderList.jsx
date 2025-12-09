import { useOrders } from '../context/OrderContext';
import './OrderList.css';

function OrderList() {
  const { orders, updateOrderStatus } = useOrders();

  const formatDate = (date) => {
    const d = new Date(date);
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
        >
          제조 시작
        </button>
      );
    } else if (order.status === 'PREPARING') {
      return (
        <button
          className="order-list__status-btn order-list__status-btn--secondary"
          onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
        >
          제조 완료
        </button>
      );
    } else {
      return (
        <span className="order-list__status-completed">제조 완료</span>
      );
    }
  };

  return (
    <div className="order-list">
      <h2 className="order-list__title">주문 현황</h2>
      {orders.length === 0 ? (
        <p className="order-list__empty">주문이 없습니다.</p>
      ) : (
        <div className="order-list__items">
          {orders.map((order) => (
            <div key={order.id} className="order-list__item">
              <div className="order-list__item-info">
                <div className="order-list__time">
                  {formatDate(order.orderTime)}
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

