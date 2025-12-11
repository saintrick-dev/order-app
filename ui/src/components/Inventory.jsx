import { useInventory } from '../context/InventoryContext';
import './Inventory.css';

function Inventory() {
  const { inventory, updateInventory, getInventoryStatus, loading, error } = useInventory();

  if (loading) {
    return (
      <div className="inventory">
        <h2 className="inventory__title">재고 현황</h2>
        <div className="inventory__loading">재고 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory">
        <h2 className="inventory__title">재고 현황</h2>
        <div className="inventory__error">
          <p>재고 정보를 불러올 수 없습니다.</p>
          <p className="inventory__error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="inventory">
        <h2 className="inventory__title">재고 현황</h2>
        <div className="inventory__empty">
          <p>재고 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  // 처음 3개 메뉴만 표시
  const displayItems = inventory.slice(0, 3);

  return (
    <div className="inventory">
      <h2 className="inventory__title">재고 현황</h2>
      <div className="inventory__grid">
        {displayItems.map((item) => {
          const status = getInventoryStatus(item.quantity);
          return (
            <div key={item.menuId} className="inventory__card">
              <h3 className="inventory__menu-name">{item.menuName}</h3>
              <div className="inventory__info">
                <span className="inventory__quantity">{item.quantity}개</span>
                <span
                  className="inventory__status"
                  style={{ color: status.color }}
                  aria-label={`재고 상태: ${status.text}`}
                >
                  {status.text}
                </span>
              </div>
              <div className="inventory__controls">
                <button
                  className="inventory__btn inventory__btn--decrease"
                  onClick={() => updateInventory(item.menuId, -1)}
                  disabled={item.quantity === 0}
                  aria-label={`${item.menuName} 재고 감소`}
                >
                  -
                </button>
                <button
                  className="inventory__btn inventory__btn--increase"
                  onClick={() => updateInventory(item.menuId, 1)}
                  aria-label={`${item.menuName} 재고 증가`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Inventory;
