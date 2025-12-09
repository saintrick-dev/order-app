import './Header.css';

function Header({ currentTab, onTabChange }) {
  return (
    <header className="header">
      <h1 className="header__logo">COZY</h1>
      <nav className="header__nav">
        <button
          className={`header__tab ${currentTab === 'order' ? 'header__tab--active' : ''}`}
          onClick={() => onTabChange('order')}
        >
          주문하기
        </button>
        <button
          className={`header__tab ${currentTab === 'admin' ? 'header__tab--active' : ''}`}
          onClick={() => onTabChange('admin')}
        >
          관리자
        </button>
      </nav>
    </header>
  );
}

export default Header;

