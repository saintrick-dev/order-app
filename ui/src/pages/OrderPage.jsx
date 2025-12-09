import { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useInventory } from '../context/InventoryContext';
import MenuCard from '../components/MenuCard';
import Cart from '../components/Cart';
import { menuItems } from '../data/menuData';
import './OrderPage.css';

function OrderPage() {
  const [cartItems, setCartItems] = useState([]);
  const { addOrder } = useOrders();
  const { canOrder, decreaseInventoryForOrder } = useInventory();

  const handleAddToCart = (menu, selectedOptions) => {
    const optionPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    const itemTotalPrice = menu.price + optionPrice;

    // 동일 메뉴+옵션 조합 찾기
    const optionIds = selectedOptions.map((opt) => opt.id).sort().join(',');
    const existingIndex = cartItems.findIndex((item) => {
      const itemOptionIds = item.options.map((opt) => opt.id).sort().join(',');
      return item.menuId === menu.id && itemOptionIds === optionIds;
    });

    if (existingIndex >= 0) {
      // 수량 증가
      setCartItems((prev) =>
        prev.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: item.totalPrice + itemTotalPrice,
              }
            : item
        )
      );
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
    }
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      // 항목 삭제
      setCartItems((prev) => prev.filter((_, i) => i !== index));
    } else {
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
    }
  };

  const handleOrder = () => {
    if (cartItems.length === 0) return;

    // 재고 확인
    if (!canOrder(cartItems)) {
      alert('재고가 부족합니다. 주문할 수 없습니다.');
      return;
    }

    const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // 주문 추가
    addOrder({
      items: cartItems,
      totalPrice: totalPrice,
    });

    // 재고 감소
    decreaseInventoryForOrder(cartItems);

    alert(`주문이 완료되었습니다!\n총 금액: ${totalPrice.toLocaleString()}원`);
    setCartItems([]);
  };

  return (
    <div className="order-page">
      <div className="order-page__menu-grid">
        {menuItems.map((menu) => (
          <MenuCard key={menu.id} menu={menu} onAddToCart={handleAddToCart} />
        ))}
      </div>
      <Cart
        items={cartItems}
        onOrder={handleOrder}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  );
}

export default OrderPage;
