import React from "react";
import { getColorPalette } from "../../utils/petColors";
import "./PetSvg.css";

const DogSvg = ({ state = "idle", mood = "happy", size = 120, colorId = "brown" }) => {
  const colors = getColorPalette("dog", colorId);

  const getEyeStyle = () => {
    if (state === "sleep") return "sleeping";
    if (mood === "sad") return "sad";
    if (mood === "sick") return "sick";
    return "happy";
  };

  const getMouthStyle = () => {
    if (state === "eating") return "eating";
    if (state === "sleep") return "sleeping";
    if (mood === "happy") return "happy";
    if (mood === "sad") return "sad";
    return "neutral";
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`pet-svg dog-svg state-${state}`}
    >
      {/* 꼬리 */}
      <g className="tail">
        <path
          d="M75 65 Q 90 55, 85 45 Q 80 48, 75 60"
          fill={colors.dark}
          className={state === "idle" || state === "happy" ? "wagging" : ""}
        />
      </g>

      {/* 몸통 */}
      <ellipse cx="50" cy="65" rx="28" ry="22" fill={colors.main} />

      {/* 배 */}
      <ellipse cx="50" cy="70" rx="18" ry="12" fill={colors.belly} />

      {/* 앞다리 */}
      <g className={`legs ${state === "walking" ? "walking" : ""}`}>
        <rect
          x="30"
          y="78"
          width="10"
          height="18"
          rx="5"
          fill={colors.dark}
          className="leg-left"
        />
        <rect
          x="60"
          y="78"
          width="10"
          height="18"
          rx="5"
          fill={colors.dark}
          className="leg-right"
        />
      </g>

      {/* 머리 */}
      <circle cx="50" cy="38" r="26" fill={colors.main} />

      {/* 귀 */}
      <ellipse
        cx="28"
        cy="25"
        rx="10"
        ry="18"
        fill={colors.dark}
        transform="rotate(-15, 28, 25)"
        className="ear-left"
      />
      <ellipse
        cx="72"
        cy="25"
        rx="10"
        ry="18"
        fill={colors.dark}
        transform="rotate(15, 72, 25)"
        className="ear-right"
      />

      {/* 귀 안쪽 */}
      <ellipse
        cx="28"
        cy="27"
        rx="5"
        ry="10"
        fill={colors.accent}
        transform="rotate(-15, 28, 27)"
      />
      <ellipse
        cx="72"
        cy="27"
        rx="5"
        ry="10"
        fill={colors.accent}
        transform="rotate(15, 72, 27)"
      />

      {/* 얼굴 */}
      <g className="face">
        {/* 볼 터치 */}
        <ellipse cx="32" cy="45" rx="6" ry="4" fill={colors.accent} opacity="0.6" />
        <ellipse cx="68" cy="45" rx="6" ry="4" fill={colors.accent} opacity="0.6" />

        {/* 눈 */}
        <g className={`eyes ${getEyeStyle()}`}>
          {state === "sleep" ? (
            <>
              <path
                d="M38 38 Q 42 42, 46 38"
                stroke="#333"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M54 38 Q 58 42, 62 38"
                stroke="#333"
                strokeWidth="2"
                fill="none"
              />
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

        {/* 코 */}
        <ellipse cx="50" cy="48" rx="5" ry="4" fill="#333" />
        <ellipse cx="50" cy="47" rx="2" ry="1" fill="#666" />

        {/* 입 */}
        <g className={`mouth ${getMouthStyle()}`}>
          {state === "eating" ? (
            <ellipse cx="50" cy="55" rx="6" ry="5" fill="#FF6B6B" />
          ) : getMouthStyle() === "happy" ? (
            <path
              d="M42 52 Q 50 60, 58 52"
              stroke="#333"
              strokeWidth="2"
              fill="none"
            />
          ) : getMouthStyle() === "sad" ? (
            <path
              d="M42 56 Q 50 50, 58 56"
              stroke="#333"
              strokeWidth="2"
              fill="none"
            />
          ) : (
            <path d="M45 54 L 55 54" stroke="#333" strokeWidth="2" />
          )}
        </g>
      </g>

      {/* 잠잘 때 ZZZ */}
      {state === "sleep" && (
        <g className="zzz">
          <text x="70" y="20" fontSize="10" fill="#7C4DFF" className="z1">
            Z
          </text>
          <text x="78" y="12" fontSize="8" fill="#7C4DFF" className="z2">
            z
          </text>
          <text x="84" y="6" fontSize="6" fill="#7C4DFF" className="z3">
            z
          </text>
        </g>
      )}

      {/* 아플 때 표시 */}
      {mood === "sick" && (
        <g className="sick-indicator">
          <circle cx="75" cy="25" r="8" fill="#4CAF50" opacity="0.8" />
          <text x="75" y="28" fontSize="10" textAnchor="middle" fill="#FFF">
            🤢
          </text>
        </g>
      )}
    </svg>
  );
};

export default DogSvg;
