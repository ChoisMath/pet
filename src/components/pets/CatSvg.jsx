import React from 'react';
import { getColorPalette } from '../../utils/petColors';
import './PetSvg.css';

const CatSvg = ({ state = 'idle', mood = 'happy', visualMode = 'normal', size = 120, colorId = 'gray' }) => {
  const colors = getColorPalette('cat', colorId);

  const getEyeStyle = () => {
    if (state === 'sleep' || visualMode === 'sleep') return 'sleeping';
    if (visualMode === 'critical' || visualMode === "starving") return 'dead';
    if (visualMode === 'fever') return 'tired';
    if (visualMode === 'tired' || visualMode === 'collapsed') return 'tired';
    if (visualMode === 'rebellious') return 'angry';
    if (visualMode === 'sulky') return 'sad';

    if (mood === 'sad') return 'sad';
    if (mood === 'sick') return 'sick';
    return 'happy';
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`pet-svg cat-svg state-${state} mode-${visualMode}`}
    >
      {/* 꼬리 */}
      <g className="tail">
        <path 
          d="M78 70 Q 95 60, 92 40 Q 88 35, 82 50 Q 80 60, 75 65" 
          fill="none"
          stroke={colors.dark}
          strokeWidth="8"
          strokeLinecap="round"
          className={state === 'idle' || (state === 'happy' && visualMode === 'normal') ? 'swaying' : ''}
        />
      </g>

      {/* 몸통 */}
      <ellipse cx="50" cy="68" rx="25" ry="20" fill={colors.main} />
      
      {/* 배 */}
      <ellipse cx="50" cy="72" rx="15" ry="12" fill={colors.belly} />
      
      {/* 앞다리 */}
      <g className={`legs ${state === 'walking' ? 'walking' : ''}`}>
        {visualMode === 'collapsed' ? (
          <>
            <rect x="28" y="80" width="12" height="6" rx="3" fill={colors.dark} />
            <rect x="58" y="80" width="12" height="6" rx="3" fill={colors.dark} />
          </>
        ) : (
          <>
            <rect x="32" y="80" width="8" height="16" rx="4" fill={colors.dark} className="leg-left" />
            <rect x="60" y="80" width="8" height="16" rx="4" fill={colors.dark} className="leg-right" />
          </>
        )}
      </g>

      {/* 머리 */}
      <circle cx="50" cy="40" r="24" fill={colors.main} />
      
      {/* 뾰족한 귀 */}
      <polygon points="25,30 20,5 38,22" fill={colors.main} className="ear-left" />
      <polygon points="75,30 80,5 62,22" fill={colors.main} className="ear-right" />
      
      {/* 귀 안쪽 */}
      <polygon points="27,27 24,12 35,23" fill={colors.accent} />
      <polygon points="73,27 76,12 65,23" fill={colors.accent} />

      {/* 얼굴 */}
      <g className="face">
        {/* 볼 터치 */}
        <ellipse cx="30" cy="48" rx="7" ry="4" fill={visualMode === "fever" ? "#FF0000" : colors.accent} opacity={visualMode === "fever" ? "0.6" : "0.5"} />
        <ellipse cx="70" cy="48" rx="7" ry="4" fill={visualMode === "fever" ? "#FF0000" : colors.accent} opacity={visualMode === "fever" ? "0.6" : "0.5"} />
        
        {/* 눈 */}
        <g className={`eyes ${getEyeStyle()}`}>
          {getEyeStyle() === 'sleeping' ? (
            <>
              <path d="M36 38 Q 40 42, 44 38" stroke="#333" strokeWidth="2" fill="none" />
              <path d="M56 38 Q 60 42, 64 38" stroke="#333" strokeWidth="2" fill="none" />
            </>
          ) : getEyeStyle() === 'dead' ? (
            <>
              <path d="M36 34 L44 42 M44 34 L36 42" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              <path d="M56 34 L64 42 M64 34 L56 42" stroke="#333" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : getEyeStyle() === 'tired' ? (
            <>
              <path d="M36 36 L40 40 L36 44" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M44 36 L40 40 L44 44" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M56 36 L60 40 L56 44" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M64 36 L60 40 L64 44" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : getEyeStyle() === 'angry' ? (
             <>
               <path d="M33 32 L 46 38" stroke="#333" strokeWidth="2" />
               <path d="M67 32 L 54 38" stroke="#333" strokeWidth="2" />
               <ellipse cx="40" cy="38" rx="2" ry="5" fill="#333" />
               <ellipse cx="60" cy="38" rx="2" ry="5" fill="#333" />
             </>
          ) : getEyeStyle() === 'sad' ? (
             <>
               <ellipse cx="40" cy="38" rx="2" ry="5" fill="#333" />
               <ellipse cx="60" cy="38" rx="2" ry="5" fill="#333" />
               <path d="M35 45 Q 35 50, 38 48" stroke="#4FC3F7" strokeWidth="2" fill="none" />
             </>
          ) : (
            <>
              <ellipse cx="40" cy="38" rx="6" ry="7" fill={colors.eye || '#90CAF9'} />
              <ellipse cx="60" cy="38" rx="6" ry="7" fill={colors.eye || '#90CAF9'} />
              <ellipse cx="40" cy="38" rx="2" ry="5" fill="#333" />
              <ellipse cx="60" cy="38" rx="2" ry="5" fill="#333" />
              <circle cx="42" cy="36" r="2" fill="#FFF" />
              <circle cx="62" cy="36" r="2" fill="#FFF" />
            </>
          )}
        </g>
        
        {/* 선글라스 (Rebellious) */}
        {visualMode === "rebellious" && (
           <g className="sunglasses">
             <path d="M28 34 Q 40 34, 46 38 Q 40 44, 28 42 Z" fill="#222" />
             <path d="M72 34 Q 60 34, 54 38 Q 60 44, 72 42 Z" fill="#222" />
             <line x1="46" y1="38" x2="54" y2="38" stroke="#222" strokeWidth="2" />
           </g>
        )}

        {/* 코 */}
        <polygon points="50,46 47,50 53,50" fill={colors.accent} />

        {/* 수염 */}
        <g className="whiskers">
          <line x1="25" y1="48" x2="38" y2="50" stroke="#666" strokeWidth="1" />
          <line x1="25" y1="52" x2="38" y2="52" stroke="#666" strokeWidth="1" />
          <line x1="25" y1="56" x2="38" y2="54" stroke="#666" strokeWidth="1" />
          <line x1="75" y1="48" x2="62" y2="50" stroke="#666" strokeWidth="1" />
          <line x1="75" y1="52" x2="62" y2="52" stroke="#666" strokeWidth="1" />
          <line x1="75" y1="56" x2="62" y2="54" stroke="#666" strokeWidth="1" />
        </g>

        {/* 입 */}
        <g className="mouth">
          {state === 'eating' ? (
            <ellipse cx="50" cy="56" rx="5" ry="4" fill="#FF6B6B" />
          ) : visualMode === "fever" || visualMode === "tired" || visualMode === "collapsed" ? (
             <path d="M42 56 Q 46 53, 50 56 Q 54 59, 58 56" stroke="#333" strokeWidth="1.5" fill="none" />
          ) : visualMode === "rebellious" ? (
             <path d="M45 56 L 55 56" stroke="#333" strokeWidth="1.5" />
          ) : visualMode === "sulky" ? (
             <path d="M46 58 Q 50 54, 54 58" stroke="#333" strokeWidth="1.5" fill="none" />
          ) : mood === 'happy' ? (
            <>
              <path d="M46 54 Q 50 58, 50 54" stroke="#333" strokeWidth="1.5" fill="none" />
              <path d="M50 54 Q 50 58, 54 54" stroke="#333" strokeWidth="1.5" fill="none" />
            </>
          ) : (
            <path d="M47 55 L 53 55" stroke="#333" strokeWidth="1.5" />
          )}
        </g>
        
        {/* 지침 효과 (땀) */}
        {(visualMode === 'tired' || visualMode === 'collapsed' || visualMode === 'fever') && (
          <path d="M72 35 Q 75 32, 78 35 Q 78 42, 72 40" fill="#4FC3F7" />
        )}
      </g>

      {/* 머리 위 수건 (Critical) */}
      {visualMode === "critical" && (
        <rect x="35" y="15" width="30" height="10" rx="2" fill="#FFF" stroke="#DDD" />
      )}
      
      {/* 링겔 (Critical) */}
      {visualMode === "critical" && (
        <g className="iv-drip" transform="translate(5, 20)">
           <rect x="0" y="0" width="10" height="20" rx="2" fill="#E0F7FA" stroke="#4DD0E1" />
           <line x1="5" y1="20" x2="5" y2="60" stroke="#DDD" strokeWidth="2" />
           <path d="M5 20 Q 20 40, 30 50" stroke="#E0F7FA" strokeWidth="2" fill="none" />
        </g>
      )}

      {/* 💢 아이콘 (Rebellious) */}
      {visualMode === "rebellious" && (
        <path d="M80 20 L 90 25 L 85 35 M 82 22 L 95 22" stroke="#FF5252" strokeWidth="3" />
      )}

      {/* 잠잘 때 ZZZ */}
      {(state === 'sleep' || visualMode === 'sleep') && (
        <g className="zzz">
          <text x="72" y="18" fontSize="10" fill="#7C4DFF" className="z1">Z</text>
          <text x="80" y="10" fontSize="8" fill="#7C4DFF" className="z2">z</text>
        </g>
      )}

      {/* 놀이 중 */}
      {state === 'playing' && (
        <g className="yarn animate-bounce">
          <circle cx="20" cy="85" r="8" fill="#FF6B6B" />
          <path d="M20 85 Q 15 80, 25 78 Q 18 75, 22 82" stroke="#FF8A8A" strokeWidth="1" fill="none" />
        </g>
      )}
    </svg>
  );
};

export default CatSvg;
