const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  console.log(`🌐 API 요청: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, config);
    console.log(`📡 API 응답 상태: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = 'API 요청 실패';
      try {
        const data = await response.json();
        console.error('❌ API 오류 응답:', data);
        errorMessage = data.error?.message || `서버 오류 (${response.status})`;
      } catch (e) {
        console.error('❌ 응답 파싱 오류:', e);
        errorMessage = `서버 오류 (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ API 응답 성공:`, data);
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      console.error('❌ API 서버에 연결할 수 없습니다:', error);
      console.error('서버 URL:', url);
      console.error('서버가 실행 중인지 확인해주세요: http://localhost:3000/health');
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
    
    console.error('❌ API 요청 오류:', error);
    console.error('에러 상세:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

export const menuAPI = {
  getMenus: () => apiRequest('/menus'),
  updateStock: (menuId, quantity) =>
    apiRequest(`/menus/${menuId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
};

export const orderAPI = {
  createOrder: (orderData) =>
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  getOrders: () => apiRequest('/orders'),
  getOrderById: (orderId) => apiRequest(`/orders/${orderId}`),
  updateOrderStatus: (orderId, status) =>
    apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

