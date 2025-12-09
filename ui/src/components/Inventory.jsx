import { useInventory } from '../context/InventoryContext';
import './Inventory.css';

function Inventory() {
  const { inventory, updateInventory, getInventoryStatus } = useInventory();

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
                >
                  {status.text}
                </span>
              </div>
              <div className="inventory__controls">
                <button
                  className="inventory__btn inventory__btn--decrease"
                  onClick={() => updateInventory(item.menuId, -1)}
                  disabled={item.quantity === 0}
                >
                  -
                </button>
                <button
                  className="inventory__btn inventory__btn--increase"
                  onClick={() => updateInventory(item.menuId, 1)}
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
