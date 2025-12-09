import { useState } from 'react';
import { OrderProvider } from './context/OrderContext';
import { InventoryProvider } from './context/InventoryContext';
import Header from './components/Header';
import OrderPage from './pages/OrderPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState('order');

  return (
    <OrderProvider>
      <InventoryProvider>
        <div className="app">
          <Header currentTab={currentTab} onTabChange={setCurrentTab} />
          <main className="app__main">
            {currentTab === 'order' && <OrderPage />}
            {currentTab === 'admin' && <AdminPage />}
          </main>
        </div>
      </InventoryProvider>
    </OrderProvider>
  );
}

export default App;
