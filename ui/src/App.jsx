import { useState } from 'react';
import Header from './components/Header';
import OrderPage from './pages/OrderPage';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState('order');

  return (
    <div className="app">
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />
      <main className="app__main">
        {currentTab === 'order' && <OrderPage />}
        {currentTab === 'admin' && (
          <div className="app__placeholder">
            <p>관리자 화면은 준비 중입니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
