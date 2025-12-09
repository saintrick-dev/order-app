import Dashboard from '../components/Dashboard';
import Inventory from '../components/Inventory';
import OrderList from '../components/OrderList';
import './AdminPage.css';

function AdminPage() {
  return (
    <div className="admin-page">
      <Dashboard />
      <Inventory />
      <OrderList />
    </div>
  );
}

export default AdminPage;

