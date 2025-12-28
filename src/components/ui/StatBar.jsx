import React from 'react';
import './StatBar.css';

const StatBar = ({ 
  label, 
  value, 
  maxValue = 100, 
  color = 'var(--primary)',
  icon,
  showLabel = true,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // 값에 따른 색상 변화
  const getBarColor = () => {
    if (percentage <= 20) return 'var(--danger)';
    if (percentage <= 40) return 'var(--warning)';
    return color;
  };

  // 위험 상태일 때 애니메이션
  const isDanger = percentage <= 20;
  const isWarning = percentage <= 40;

  return (
    <div className={`stat-bar-container size-${size}`}>
      {showLabel && (
        <div className="stat-label">
          {icon && <span className="stat-icon">{icon}</span>}
          <span className="stat-name">{label}</span>
          <span className="stat-value">{Math.round(value)}</span>
        </div>
      )}
      
      <div className="stat-bar-track">
        <div 
          className={`stat-bar-fill ${isDanger ? 'danger' : ''} ${isWarning ? 'warning' : ''}`}
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getBarColor()
          }}
        >
          {/* 반짝이 효과 */}
          <div className="stat-bar-shine"></div>
        </div>
      </div>
    </div>
  );
};

export default StatBar;
