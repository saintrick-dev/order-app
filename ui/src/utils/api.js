// 환경 변수에서 API URL 가져오기 (빌드 시점에 주입됨)
const isProduction = import.meta.env.MODE === 'production';
const envApiUrl = import.meta.env.VITE_API_URL;

// 프로덕션 백엔드 URL (기본값)
const PRODUCTION_API_URL = 'https://order-app-backend-8jtr.onrender.com/api';

// 프로덕션 환경에서는 환경 변수가 필수
let API_BASE_URL;
if (isProduction) {
  // 프로덕션 환경: 환경 변수가 없으면 기본 프로덕션 URL 사용
  if (!envApiUrl || envApiUrl === 'undefined' || envApiUrl === '') {
    console.warn('⚠️ VITE_API_URL이 설정되지 않아 기본 프로덕션 URL을 사용합니다.');
    console.warn('⚠️ Render 대시보드에서 Environment Variables에 VITE_API_URL을 설정하는 것을 권장합니다.');
    API_BASE_URL = PRODUCTION_API_URL;
  } else if (envApiUrl.includes('localhost') || envApiUrl.includes('127.0.0.1')) {
    console.error('❌ 프로덕션 환경에서 localhost를 사용할 수 없습니다!');
    console.error('❌ 기본 프로덕션 URL을 사용합니다.');
    API_BASE_URL = PRODUCTION_API_URL;
  } else {
    API_BASE_URL = envApiUrl;
  }
} else {
  // 개발 환경: 환경 변수가 있으면 사용, 없으면 프로덕션 URL 사용 (로컬 개발 시)
  API_BASE_URL = envApiUrl || PRODUCTION_API_URL;
}

// 디버깅: 현재 사용 중인 API URL 확인
console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', import.meta.env.MODE);
console.log('🔧 VITE_API_URL (env):', envApiUrl);
console.log('🔧 Is Production:', isProduction);

// API URL 유효성 검사
function validateApiUrl() {
  if (!API_BASE_URL || API_BASE_URL === 'undefined' || API_BASE_URL === 'null') {
    if (isProduction) {
      console.error('❌ 프로덕션 환경에서 API URL이 설정되지 않았습니다.');
      console.error('❌ Render 대시보드 → Static Site → Environment Variables');
      console.error('❌ Key: VITE_API_URL');
      console.error('❌ Value: https://your-backend.onrender.com/api');
      return false;
    } else {
      console.error('❌ 개발 환경에서 API URL이 설정되지 않았습니다.');
      return false;
    }
  }
  
  // 프로덕션에서 localhost 사용 방지
  if (isProduction && (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1'))) {
    console.error('❌ 프로덕션 환경에서 localhost를 사용할 수 없습니다!');
    console.error('❌ VITE_API_URL을 프로덕션 백엔드 URL로 설정해주세요.');
    return false;
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
  // API URL 유효성 검사 (요청 전에 먼저 확인)
  if (!validateApiUrl()) {
    if (isProduction) {
      throw new Error(
        '프로덕션 환경에서 API 서버 URL이 설정되지 않았습니다.\n\n' +
        'Render 대시보드에서 다음을 설정해주세요:\n' +
        '1. Static Site → Environment Variables\n' +
        '2. Key: VITE_API_URL\n' +
        '3. Value: https://your-backend.onrender.com/api\n' +
        '4. 설정 후 재배포'
      );
    } else {
      throw new Error('API 서버 URL이 설정되지 않았습니다. 환경 변수 VITE_API_URL을 확인해주세요.');
    }
  }
  
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

