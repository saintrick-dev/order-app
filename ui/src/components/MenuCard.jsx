import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useToast } from '../context/ToastContext';
import { options } from '../data/menuData';
import './MenuCard.css';

function MenuCard({ menu, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const { getInventoryByMenuId } = useInventory();
  const { showToast } = useToast();
  const inventoryItem = getInventoryByMenuId(menu.id);
  const isOutOfStock = !inventoryItem || inventoryItem.quantity === 0;

  const handleOptionChange = (option) => {
    setSelectedOptions((prev) => {
      if (prev.find((opt) => opt.id === option.id)) {
        return prev.filter((opt) => opt.id !== option.id);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast('품절된 상품입니다.', 'error');
      return;
    }
    onAddToCart(menu, selectedOptions);
    setSelectedOptions([]);
  };

  return (
    <div className="menu-card">
      <div className="menu-card__image">
        {menu.image ? (
          <img src={menu.image} alt={menu.name} />
        ) : (
          <div className="menu-card__image-placeholder">
            <svg viewBox="0 0 100 100" className="menu-card__placeholder-icon" aria-hidden="true">
              <line x1="0" y1="0" x2="100" y2="100" stroke="#999" strokeWidth="1" />
              <line x1="100" y1="0" x2="0" y2="100" stroke="#999" strokeWidth="1" />
              <rect x="0" y="0" width="100" height="100" fill="none" stroke="#999" strokeWidth="2" />
            </svg>
          </div>
        )}
      </div>
      <div className="menu-card__content">
        <h3 className="menu-card__name">{menu.name}</h3>
        <p className="menu-card__price">{menu.price.toLocaleString()}원</p>
        <p className="menu-card__description">{menu.description}</p>
        {isOutOfStock && (
          <p className="menu-card__out-of-stock" role="alert">품절</p>
        )}
        <div className="menu-card__options">
          {options.map((option) => (
            <label key={option.id} className="menu-card__option">
              <input
                type="checkbox"
                checked={selectedOptions.some((opt) => opt.id === option.id)}
                onChange={() => handleOptionChange(option)}
                disabled={isOutOfStock}
                aria-label={`${option.name} 옵션 선택`}
              />
              <span>
                {option.name} (+{option.price.toLocaleString()}원)
              </span>
            </label>
          ))}
        </div>
        <button
          className="menu-card__button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={isOutOfStock ? '품절된 상품' : `${menu.name} 장바구니에 담기`}
        >
          {isOutOfStock ? '품절' : '담기'}
        </button>
      </div>
    </div>
  );
}

export default MenuCard;
