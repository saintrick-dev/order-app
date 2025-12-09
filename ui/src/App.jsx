import { useState } from 'react';
import { OrderProvider } from './context/OrderContext';
import { InventoryProvider } from './context/InventoryContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import OrderPage from './pages/OrderPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState('order');

  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}

export default App;
