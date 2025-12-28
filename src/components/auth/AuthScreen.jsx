import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthScreen.css';

const AuthScreen = () => {
  const { login, register, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // 로그인
        if (!formData.username || !formData.password) {
          setFormError('사용자명과 비밀번호를 입력해주세요.');
          return;
        }
        const result = await login(formData.username, formData.password);
        if (!result.success) {
          setFormError(result.error);
        }
      } else {
        // 회원가입
        if (!formData.username || !formData.password) {
          setFormError('모든 필드를 입력해주세요.');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setFormError('비밀번호가 일치하지 않습니다.');
          return;
        }
        if (formData.password.length < 1) {
          setFormError('비밀번호는 1자 이상이어야 합니다.');
          return;
        }
        const result = await register(formData.username, formData.password);
        if (!result.success) {
          setFormError(result.error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormError('');
    setFormData({
      username: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        {/* 로고 */}
        <div className="auth-logo">
          <span className="logo-emoji">🐾</span>
          <h1>다마고치</h1>
          <p>나만의 펫을 키워보세요!</p>
        </div>

        {/* 폼 */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{isLogin ? '로그인' : '회원가입'}</h2>
          
          {(formError || error) && (
            <div className="error-message">
              ⚠️ {formError || error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="사용자명 입력"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호 다시 입력"
                autoComplete="new-password"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
          </button>
        </form>

        {/* 모드 전환 */}
        <div className="auth-switch">
          <p>
            {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            <button onClick={toggleMode}>
              {isLogin ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>

        {/* 게스트 모드 */}
        <div className="guest-mode">
          <p>또는</p>
          <button 
            className="guest-btn"
            onClick={() => {
              // 로컬 스토리지만 사용하는 게스트 모드
              localStorage.setItem('tamagotchi_guest', 'true');
              window.location.reload();
            }}
          >
            🎮 게스트로 시작하기
          </button>
          <span className="guest-notice">* 게스트 모드는 이 기기에서만 저장됩니다</span>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
