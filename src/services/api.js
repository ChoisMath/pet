// API 기본 URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 토큰 저장/불러오기
export const getToken = () => localStorage.getItem('tamagotchi_token');
export const setToken = (token) => localStorage.setItem('tamagotchi_token', token);
export const removeToken = () => localStorage.removeItem('tamagotchi_token');

// API 요청 헬퍼
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '요청 실패');
  }

  return data;
};

// ===== 인증 API =====

export const register = async (username, email, password) => {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
  
  if (data.token) {
    setToken(data.token);
  }
  
  return data;
};

export const login = async (username, password) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  if (data.token) {
    setToken(data.token);
  }
  
  return data;
};

export const logout = () => {
  removeToken();
};

export const getCurrentUser = async () => {
  return apiRequest('/auth/me');
};

// ===== 게임 데이터 API =====

export const loadGameData = async () => {
  return apiRequest('/game/load');
};

export const saveGameData = async (gameState) => {
  return apiRequest('/game/save', {
    method: 'POST',
    body: JSON.stringify(gameState)
  });
};

export const resetGameData = async () => {
  return apiRequest('/game/reset', {
    method: 'POST'
  });
};

// 로그인 상태 확인
export const isLoggedIn = () => {
  return !!getToken();
};
