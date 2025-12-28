import React from "react";
import { getColorPalette } from "../../utils/petColors";
import "./PetSvg.css";

const DogSvg = ({ state = "idle", mood = "happy", visualMode = "normal", size = 120, colorId = "brown" }) => {
  const colors = getColorPalette("dog", colorId);

  const getEyeStyle = () => {
    if (state === "sleep" || visualMode === "sleep") return "sleeping";
    if (visualMode === "critical" || visualMode === "starving") return "dead"; // X X
    if (visualMode === "fever") return "tired";
    if (visualMode === "tired" || visualMode === "collapsed") return "tired"; // > <
    if (visualMode === "rebellious") return "angry";
    if (visualMode === "sulky") return "sad";
    
    if (mood === "sad") return "sad";
    if (mood === "sick") return "sick";
    return "happy";
  };

  const getMouthStyle = () => {
    if (state === "eating") return "eating";
    if (state === "sleep") return "sleeping";
    
    if (visualMode === "critical") return "neutral";
    if (visualMode === "rebellious") return "angry"; // ㅡ shape
    if (visualMode === "sulky") return "pout"; // ^ shape inverse
    if (visualMode === "fever" || visualMode === "tired" || visualMode === "collapsed") return "wavy";
    
    if (mood === "happy") return "happy";
    if (mood === "sad") return "sad";
    return "neutral";
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`pet-svg dog-svg state-${state} mode-${visualMode}`}
    >
      {/* 꼬리 */}
      <g className="tail">
        <path
          d="M75 65 Q 90 55, 85 45 Q 80 48, 75 60"
          fill={colors.dark}
          className={state === "idle" || (state === "happy" && visualMode === "normal") ? "wagging" : ""}
        />
      </g>

      {/* 몸통 */}
      <ellipse cx="50" cy="65" rx="28" ry="22" fill={colors.main} />

      {/* 배 */}
      <ellipse cx="50" cy="70" rx="18" ry="12" fill={colors.belly} />

      {/* 앞다리 (주저앉음/Collapsed일 때 위치 변경) */}
      <g className={`legs ${state === "walking" ? "walking" : ""}`}>
        {visualMode === "collapsed" ? (
          <>
             {/* 앉은 다리 (앞으로 뻗음) */}
             <rect x="25" y="80" width="18" height="8" rx="4" fill={colors.dark} />
             <rect x="57" y="80" width="18" height="8" rx="4" fill={colors.dark} />
          </>
        ) : (
          <>
            <rect x="30" y="78" width="10" height="18" rx="5" fill={colors.dark} className="leg-left" />
            <rect x="60" y="78" width="10" height="18" rx="5" fill={colors.dark} className="leg-right" />
          </>
        )}
      </g>

      {/* 머리 */}
      <circle cx="50" cy="38" r="26" fill={colors.main} />

      {/* 귀 */}
      <ellipse cx="28" cy="25" rx="10" ry="18" fill={colors.dark} transform="rotate(-15, 28, 25)" className="ear-left" />
      <ellipse cx="72" cy="25" rx="10" ry="18" fill={colors.dark} transform="rotate(15, 72, 25)" className="ear-right" />

      {/* 귀 안쪽 */}
      <ellipse cx="28" cy="27" rx="5" ry="10" fill={colors.accent} transform="rotate(-15, 28, 27)" />
      <ellipse cx="72" cy="27" rx="10" ry="10" fill={colors.accent} transform="rotate(15, 72, 27)" />

      {/* 얼굴 */}
      <g className="face">
        {/* 볼 터치 (Fever일 때 진하게) */}
        <ellipse cx="32" cy="45" rx="6" ry="4" fill={visualMode === "fever" ? "#FF0000" : colors.accent} opacity={visualMode === "fever" ? "0.6" : "0.6"} />
        <ellipse cx="68" cy="45" rx="6" ry="4" fill={visualMode === "fever" ? "#FF0000" : colors.accent} opacity={visualMode === "fever" ? "0.6" : "0.6"} />

        {/* 눈 렌더링 */}
        <g className={`eyes ${getEyeStyle()}`}>
          {getEyeStyle() === "sleeping" ? (
             <>
               <path d="M38 38 Q 42 42, 46 38" stroke="#333" strokeWidth="2" fill="none" />
               <path d="M54 38 Q 58 42, 62 38" stroke="#333" strokeWidth="2" fill="none" />
             </>
          ) : getEyeStyle() === "dead" ? (
             <>
               <path d="M38 34 L46 42 M46 34 L38 42" stroke="#333" strokeWidth="2" strokeLinecap="round" />
               <path d="M54 34 L62 42 M62 34 L54 42" stroke="#333" strokeWidth="2" strokeLinecap="round" />
             </>
          ) : getEyeStyle() === "tired" ? (
             <>
               <path d="M38 36 L42 40 L38 44" stroke="#333" strokeWidth="2" fill="none" />
               <path d="M46 36 L42 40 L46 44" stroke="#333" strokeWidth="2" fill="none" />
               <path d="M54 36 L58 40 L54 44" stroke="#333" strokeWidth="2" fill="none" />
               <path d="M62 36 L58 40 L62 44" stroke="#333" strokeWidth="2" fill="none" />
             </>
          ) : getEyeStyle() === "angry" ? (
             <>
               {/* 앵그리 - 눈썹 + 반원 눈 */}
               <path d="M35 32 L 48 38" stroke="#333" strokeWidth="2" />
               <path d="M65 32 L 52 38" stroke="#333" strokeWidth="2" />
               <circle cx="42" cy="38" r="4" fill="#333" />
               <circle cx="58" cy="38" r="4" fill="#333" />
             </>
          ) : getEyeStyle() === "sad" ? (
             <>
               <circle cx="42" cy="38" r="4" fill="#333" />
               <circle cx="58" cy="38" r="4" fill="#333" />
               {/* 눈물 한방울 */}
               <path d="M35 45 Q 35 50, 38 48" stroke="#4FC3F7" strokeWidth="2" fill="none" />
             </> 
          ) : (
             <>
               <circle cx="42" cy="38" r="5" fill="#333" />
               <circle cx="58" cy="38" r="5" fill="#333" />
               <circle cx="43" cy="36" r="2" fill="#FFF" />
               <circle cx="59" cy="36" r="2" fill="#FFF" />
             </>
          )}
        </g>
        
        {/* 선글라스 (Rebellious) */}
        {visualMode === "rebellious" && (
           <g className="sunglasses">
             <path d="M30 34 Q 42 34, 48 38 Q 42 44, 30 42 Z" fill="#222" />
             <path d="M70 34 Q 58 34, 52 38 Q 58 44, 70 42 Z" fill="#222" />
             <line x1="48" y1="38" x2="52" y2="38" stroke="#222" strokeWidth="2" />
           </g>
        )}

        {/* 코 */}
        <ellipse cx="50" cy="48" rx="5" ry="4" fill="#333" />
        <ellipse cx="50" cy="47" rx="2" ry="1" fill="#666" />

        {/* 입 */}
        <g className={`mouth ${getMouthStyle()}`}>
          {state === "eating" ? (
            <ellipse cx="50" cy="55" rx="6" ry="5" fill="#FF6B6B" />
          ) : getMouthStyle() === "wavy" ? (
             <path d="M42 55 Q 46 52, 50 55 Q 54 58, 58 55" stroke="#333" strokeWidth="2" fill="none" />
          ) : getMouthStyle() === "angry" ? (
             <path d="M45 55 L 55 55" stroke="#333" strokeWidth="2" />
          ) : getMouthStyle() === "pout" ? (
             <path d="M45 58 Q 50 54, 55 58" stroke="#333" strokeWidth="2" fill="none" />
          ) : getMouthStyle() === "sad" ? (
            <path d="M42 56 Q 50 50, 58 56" stroke="#333" strokeWidth="2" fill="none" />
          ) : getMouthStyle() === "happy" ? (
            <path d="M42 52 Q 50 60, 58 52" stroke="#333" strokeWidth="2" fill="none" />
          ) : (
            <path d="M45 54 L 55 54" stroke="#333" strokeWidth="2" />
          )}
        </g>
      </g>

      {/* 머리 위 수건 (Critical) */}
      {visualMode === "critical" && (
        <rect x="35" y="15" width="30" height="10" rx="2" fill="#FFF" stroke="#DDD" />
      )}
      
      {/* 링겔 (Critical) - 옆에 띄우기 (SVG 내 좌표로 표현하되 펫 범위 밖으로 나갈수도 있어 ViewBox 조정 필요하나 일단 내부에) */}
      {visualMode === "critical" && (
        <g className="iv-drip" transform="translate(10, 20)">
           <rect x="0" y="0" width="10" height="20" rx="2" fill="#E0F7FA" stroke="#4DD0E1" />
           <line x1="5" y1="20" x2="5" y2="60" stroke="#DDD" strokeWidth="2" />
           {/* 줄 */}
           <path d="M5 20 Q 20 40, 30 50" stroke="#E0F7FA" strokeWidth="2" fill="none" />
        </g>
      )}

      {/* 💢 아이콘 (Rebellious) */}
      {visualMode === "rebellious" && (
        <path d="M80 20 L 90 25 L 85 35 M 82 22 L 95 22" stroke="#FF5252" strokeWidth="3" />
      )}

      {/* 지침 땀 (Tired/Collapsed) */}
      {(visualMode === "tired" || visualMode === "collapsed" || visualMode === "fever") && (
        <path d="M75 35 Q 78 32, 81 35 Q 81 42, 75 40 Z" fill="#4FC3F7" />
      )}

      {/* 잠잘 때 ZZZ */}
      {(state === "sleep" || visualMode === "sleep") && (
        <g className="zzz">
          <text x="70" y="20" fontSize="10" fill="#7C4DFF" className="z1">Z</text>
          <text x="78" y="12" fontSize="8" fill="#7C4DFF" className="z2">z</text>
        </g>
      )}
    </svg>
  );
};

export default DogSvg;
