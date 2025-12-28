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

  const handleClick = () => {
    if (disabled || isOnCooldown) return;
    
    onClick?.();
    
    if (cooldown > 0) {
      setIsOnCooldown(true);
      setCooldownTime(cooldown);
      
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
      
      {isOnCooldown && (
        <div className="cooldown-overlay">
          <span className="cooldown-time">{cooldownTime}s</span>
        </div>
      )}
    </button>
  );
};

export default ActionButton;
