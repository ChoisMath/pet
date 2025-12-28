import React from 'react';
import './ActionButton.css';

const ActionButton = ({ 
  icon, 
  label, 
  onClick, 
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'success', 'warning', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
  cooldown = 0, // 쿨다운 시간 (초)
  children
}) => {
  const [isOnCooldown, setIsOnCooldown] = React.useState(false);
  const [cooldownTime, setCooldownTime] = React.useState(0);

  const handleClick = (e) => {
    if (disabled || isOnCooldown) return;
    
    onClick?.(e);
    
    // 기본 0.5초 딜레이 또는 지정된 쿨다운 적용
    const effectiveCooldown = Math.max(cooldown, 0.5);
    setIsOnCooldown(true);
    
    // 1초 이상일 때만 타이머 표시
    if (effectiveCooldown >= 1) {
      setCooldownTime(effectiveCooldown);
      
      const interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsOnCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // 짧은 쿨다운은 타이머 없이 처리
      setTimeout(() => {
        setIsOnCooldown(false);
      }, effectiveCooldown * 1000);
    }
  };

  return (
    <button
      className={`action-button variant-${variant} size-${size} ${isOnCooldown ? 'cooldown' : ''}`}
      onClick={handleClick}
      disabled={disabled || isOnCooldown}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {label && <span className="button-label">{label}</span>}
      {children}
      
      {isOnCooldown && cooldownTime > 0 && (
        <div className="cooldown-overlay">
          <span className="cooldown-time">{cooldownTime}s</span>
        </div>
      )}
    </button>
  );
};

export default ActionButton;
