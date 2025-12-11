import { useState, useCallback } from 'react';
import { useOrders } from '../context/OrderContext';
import { useInventory } from '../context/InventoryContext';
import { useToast } from '../context/ToastContext';
import MenuCard from '../components/MenuCard';
import Cart from '../components/Cart';
import './OrderPage.css';

function OrderPage() {
  const [cartItems, setCartItems] = useState([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const { addOrder } = useOrders();
  const { menus, canOrder, canAddToCart, decreaseInventoryForOrder, loading, error } = useInventory();
  const { showToast } = useToast();

  const handleAddToCart = useCallback((menu, selectedOptions) => {
    // 재고 확인
    if (!canAddToCart(menu.id, 1)) {
      showToast('재고가 부족합니다.', 'error');
      return;
    }

    const optionPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    const itemTotalPrice = menu.price + optionPrice;

    // 동일 메뉴+옵션 조합 찾기
    const optionIds = selectedOptions.map((opt) => opt.id).sort().join(',');
    const existingIndex = cartItems.findIndex((item) => {
      const itemOptionIds = item.options.map((opt) => opt.id).sort().join(',');
      return item.menuId === menu.id && itemOptionIds === optionIds;
    });

    if (existingIndex >= 0) {
      // 수량 증가 시 재고 확인
      const newQuantity = cartItems[existingIndex].quantity + 1;
      if (!canAddToCart(menu.id, newQuantity)) {
        showToast('재고가 부족합니다.', 'error');
        return;
      }

      setCartItems((prev) =>
        prev.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: item.totalPrice + itemTotalPrice,
              }
            : item
        )
      );
      showToast('장바구니에 추가되었습니다.', 'success');
    } else {
      // 새 항목 추가
      const newItem = {
        menuId: menu.id,
        menuName: menu.name,
        menuPrice: menu.price,
        options: selectedOptions,
        optionPrice: optionPrice,
        quantity: 1,
        totalPrice: itemTotalPrice,
      };
      setCartItems((prev) => [...prev, newItem]);
      showToast('장바구니에 추가되었습니다.', 'success');
    }
  }, [cartItems, canAddToCart, showToast]);

  const handleUpdateQuantity = useCallback((index, newQuantity) => {
    if (newQuantity <= 0) {
      // 항목 삭제
      setCartItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    const item = cartItems[index];
    // 재고 확인
    if (!canAddToCart(item.menuId, newQuantity)) {
      showToast('재고가 부족합니다.', 'error');
      return;
    }

    // 수량 업데이트
    setCartItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const unitPrice = item.menuPrice + item.optionPrice;
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: unitPrice * newQuantity,
          };
        }
        return item;
      })
    );
  }, [cartItems, canAddToCart, showToast]);

  const handleOrder = useCallback(async () => {
    if (cartItems.length === 0) {
      showToast('장바구니가 비어있습니다.', 'warning');
      return;
    }

    // 재고 확인
    if (!canOrder(cartItems)) {
      showToast('재고가 부족합니다. 주문할 수 없습니다.', 'error');
      return;
    }

    // 주문 중 상태로 변경
    setIsOrdering(true);

    const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    try {
      // 주문 항목 변환 (백엔드 API 형식에 맞춤)
      const orderItems = cartItems.map((item) => ({
        menuId: item.menuId,
        quantity: item.quantity,
        options: item.options || [],
      }));

      // 주문 생성
      await addOrder({
        items: orderItems,
        totalPrice: totalPrice,
      });

      // 재고 새로고침 (백엔드에서 재고가 감소됨)
      await decreaseInventoryForOrder(cartItems);

      showToast(`주문이 완료되었습니다! 총 금액: ${totalPrice.toLocaleString()}원`, 'success');
      setCartItems([]);
    } catch (error) {
      showToast(error.message || '주문 처리 중 오류가 발생했습니다.', 'error');
      console.error('Order error:', error);
    } finally {
      // 주문 완료 후 버튼 다시 활성화
      setIsOrdering(false);
    }
  }, [cartItems, canOrder, addOrder, decreaseInventoryForOrder, showToast]);

  if (loading) {
    return (
      <div className="order-page">
        <div className="order-page__loading">메뉴를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-page">
        <div className="order-page__error">
          <p>메뉴를 불러오는 중 오류가 발생했습니다.</p>
          <p className="order-page__error-message">{error}</p>
          <button 
            className="order-page__retry-btn"
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  if (!menus || menus.length === 0) {
    return (
      <div className="order-page">
        <div className="order-page__empty">
          <p>표시할 메뉴가 없습니다.</p>
          <button 
            className="order-page__retry-btn"
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="order-page__menu-grid">
        {menus.map((menu) => (
          <MenuCard key={menu.id} menu={menu} onAddToCart={handleAddToCart} />
        ))}
      </div>
      <Cart
        items={cartItems}
        onOrder={handleOrder}
        onUpdateQuantity={handleUpdateQuantity}
        isOrdering={isOrdering}
      />
    </div>
  );
}

export default OrderPage;
