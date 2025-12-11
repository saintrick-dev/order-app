import './Cart.css';

function Cart({ items, onOrder, onUpdateQuantity, isOrdering = false }) {
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const formatOptions = (options) => {
    if (!options || options.length === 0) return '';
    return ` (${options.map((opt) => opt.name).join(', ')})`;
  };

  const getItemKey = (item) => {
    const optionIds = item.options?.map((opt) => opt.id).sort().join(',') || '';
    return `${item.menuId}-${optionIds}`;
  };

  const handleQuantityChange = (index, delta) => {
    const newQuantity = items[index].quantity + delta;
    if (newQuantity >= 1) {
      onUpdateQuantity(index, newQuantity);
    }
  };

  const handleRemoveItem = (index) => {
    onUpdateQuantity(index, 0);
  };

  return (
    <div className="cart">
      <div className="cart__content">
        <div className="cart__header">
          <h2 className="cart__title">장바구니</h2>
          <div className="cart__total">
            <span>총 금액</span>
            <strong>{totalPrice.toLocaleString()}원</strong>
          </div>
        </div>
        <div className="cart__items">
          {items.length === 0 ? (
            <p className="cart__empty">장바구니가 비어있습니다.</p>
          ) : (
            items.map((item, index) => (
              <div key={getItemKey(item)} className="cart__item">
                <span className="cart__item-name">
                  {item.menuName}
                  {formatOptions(item.options)}
                </span>
                <div className="cart__item-quantity">
                  <button
                    className="cart__qty-btn"
                    onClick={() => handleQuantityChange(index, -1)}
                    aria-label="수량 감소"
                  >
                    -
                  </button>
                  <span className="cart__qty-value">{item.quantity}</span>
                  <button
                    className="cart__qty-btn"
                    onClick={() => handleQuantityChange(index, 1)}
                    aria-label="수량 증가"
                  >
                    +
                  </button>
                </div>
                <span className="cart__item-price">
                  {item.totalPrice.toLocaleString()}원
                </span>
                <button
                  className="cart__remove-btn"
                  onClick={() => handleRemoveItem(index)}
                  aria-label="항목 삭제"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
        <button
          className="cart__order-button"
          onClick={onOrder}
          disabled={items.length === 0 || isOrdering}
          aria-label={isOrdering ? '주문 중' : '주문하기'}
        >
          {isOrdering ? '주문 중...' : '주문하기'}
        </button>
      </div>
    </div>
  );
}

export default Cart;
