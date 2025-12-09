import './Header.css';

function Header({ currentTab, onTabChange }) {
  return (
    <header className="header">
      <h1 className="header__logo">COZY</h1>
      <nav className="header__nav" aria-label="주요 네비게이션">
        <button
          className={`header__tab ${currentTab === 'order' ? 'header__tab--active' : ''}`}
          onClick={() => onTabChange('order')}
          aria-label="주문하기 화면으로 이동"
          aria-current={currentTab === 'order' ? 'page' : undefined}
        >
          주문하기
        </button>
        <button
          className={`header__tab ${currentTab === 'admin' ? 'header__tab--active' : ''}`}
          onClick={() => onTabChange('admin')}
          aria-label="관리자 화면으로 이동"
          aria-current={currentTab === 'admin' ? 'page' : undefined}
        >
          관리자
        </button>
      </nav>
    </header>
  );
}

export default Header;
