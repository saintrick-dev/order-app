import { useOrders } from '../context/OrderContext';
import './Dashboard.css';

function Dashboard() {
  const { getOrderStats } = useOrders();
  const stats = getOrderStats();

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">관리자 대시보드</h2>
      <div className="dashboard__stats">
        <div className="dashboard__stat-box">
          <div className="dashboard__stat-label">총 주문</div>
          <div className="dashboard__stat-value">{stats.total}</div>
        </div>
        <div className="dashboard__stat-box">
          <div className="dashboard__stat-label">주문 접수</div>
          <div className="dashboard__stat-value">{stats.pending}</div>
        </div>
        <div className="dashboard__stat-box">
          <div className="dashboard__stat-label">제조 중</div>
          <div className="dashboard__stat-value">{stats.preparing}</div>
        </div>
        <div className="dashboard__stat-box">
          <div className="dashboard__stat-label">제조 완료</div>
          <div className="dashboard__stat-value">{stats.completed}</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
