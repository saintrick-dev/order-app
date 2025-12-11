// 환경 변수에서 API URL 가져오기 (빌드 시점에 주입됨)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 디버깅: 현재 사용 중인 API URL 확인
console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', import.meta.env.MODE);
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);

// API URL 유효성 검사
function validateApiUrl() {
  if (!API_BASE_URL || API_BASE_URL === 'undefined') {
    console.error('❌ VITE_API_URL이 설정되지 않았습니다.');
    return false;
  }
  
  if (API_BASE_URL === 'http://localhost:3000/api' && import.meta.env.MODE === 'production') {
    console.warn('⚠️ 프로덕션 환경에서 localhost를 사용하고 있습니다. VITE_API_URL을 설정해주세요.');
  }
  
  return true;
}

// 에러 메시지 생성
function getErrorMessage(error, url) {
  // 네트워크 오류인 경우
  if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
    const isProduction = import.meta.env.MODE === 'production';
    
    if (!validateApiUrl()) {
      return 'API 서버 URL이 설정되지 않았습니다. 환경 변수를 확인해주세요.';
    }
    
    if (isProduction) {
      return `서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.\n(URL: ${API_BASE_URL})`;
    } else {
      return `서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.\n(URL: ${url})`;
    }
  }
  
  // CORS 오류인 경우
  if (error.message.includes('CORS') || error.message.includes('cors')) {
    return 'CORS 오류가 발생했습니다. 백엔드 CORS 설정을 확인해주세요.';
  }
  
  // 기타 오류
  return error.message || '알 수 없는 오류가 발생했습니다.';
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // API URL 유효성 검사
  if (!validateApiUrl()) {
    throw new Error('API 서버 URL이 설정되지 않았습니다. 환경 변수 VITE_API_URL을 확인해주세요.');
  }
  
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
    const errorMessage = getErrorMessage(error, url);
    console.error('❌ API 요청 오류:', {
      name: error.name,
      message: error.message,
      url: url,
      apiBaseUrl: API_BASE_URL,
      environment: import.meta.env.MODE,
    });
    throw new Error(errorMessage);
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

