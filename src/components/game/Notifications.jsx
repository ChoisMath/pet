import React from 'react';
import { useGame } from '../../context/GameContext';
import './Notifications.css';

const Notifications = () => {
  const { state, actions } = useGame();

  return (
    <div className="notifications-container">
      {state.notifications.map((notification, index) => (
        <div 
          key={notification.id}
          className={`notification notification-${notification.type}`}
          style={{ 
            animationDelay: `${index * 0.1}s`,
          }}
          onClick={() => actions.removeNotification(notification.id)}
        >
          <span className="notification-icon">
            {notification.type === 'success' && '✅'}
            {notification.type === 'warning' && '⚠️'}
            {notification.type === 'error' && '❌'}
            {notification.type === 'info' && 'ℹ️'}
          </span>
          <span className="notification-message">{notification.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
