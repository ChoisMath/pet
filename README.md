# 다마고치 게임 (Tamagotchi)

React + Vite로 만든 다마고치 스타일 펫 키우기 게임입니다.

## 🎮 기능

### 펫 관리

- 🐶 강아지, 🐱 고양이, 🐹 햄스터 3종 펫
- 배고픔, 행복, 건강, 에너지, 청결 5가지 스탯
- 레벨업 및 성장 시스템

### 특수 놀이

- 🚶 강아지: 산책 (집 → 건물 → 산 → 집)
- 🧶 고양이: 리본 (털실 던지기 & 감기)
- 🎡 햄스터: 챗바퀴 달리기

### 클릭 코인 시스템

- 펫 클릭 시 코인 획득
- 강화 시스템 (손톱/발톱/전신) - 클릭당 코인 증가

### 상점 & 아이템 레벨

- 음식(사과/고기/쿠키) 및 약품 구매
- 아이템 레벨업 시스템 - 높은 레벨 음식은 더 효과적

### 알바 시스템

- 펫이 자고 있을 때 알바로 코인 획득
- 배달/청소/과외 선택 가능

### 로그인 시스템

- 회원가입/로그인 (PostgreSQL 연동)
- 게스트 모드 (로컬 저장)
- 사용자별 데이터 저장

## 🚀 실행하기

### 프론트엔드 (Vite)

```bash
cd tamagotchi
npm install
npm run dev
```

### 백엔드 (Express + PostgreSQL)

```bash
cd tamagotchi/server

# 환경 변수 설정
cp .env.example .env
# .env 파일 수정 (DATABASE_URL 등)

npm install
npm run dev
```

## 🌐 Railway 배포

### 1. Railway 프로젝트 생성

1. [Railway](https://railway.app/)에 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택

### 2. PostgreSQL 추가

1. "+ New" 클릭
2. "Database" → "PostgreSQL" 선택
3. 자동으로 `DATABASE_URL` 환경 변수 생성됨

### 3. 백엔드 배포

1. "New Service" → "GitHub Repo"
2. Root Directory: `tamagotchi/server`
3. 환경 변수 추가:
   - `JWT_SECRET`: 랜덤 시크릿 키
   - `FRONTEND_URL`: 프론트엔드 URL
   - `DATABASE_URL`: (PostgreSQL에서 자동 연결)

### 4. 프론트엔드 배포

1. 별도 서비스로 배포 또는 Vercel/Netlify 사용
2. 환경 변수:
   - `VITE_API_URL`: 백엔드 API URL

## 📁 프로젝트 구조

```
tamagotchi/
├── src/
│   ├── components/
│   │   ├── activities/     # 특수 활동 애니메이션
│   │   ├── auth/           # 로그인/회원가입
│   │   ├── game/           # 게임 화면
│   │   ├── pets/           # 펫 SVG
│   │   └── ui/             # UI 컴포넌트
│   ├── context/
│   │   ├── AuthContext.jsx # 인증 상태
│   │   └── GameContext.jsx # 게임 상태
│   └── services/
│       └── api.js          # API 호출
├── server/
│   ├── db.js               # PostgreSQL 연결
│   ├── server.js           # Express 서버
│   └── .env.example        # 환경 변수 템플릿
└── index.html
```

## 🛠 기술 스택

- **Frontend**: React, Vite, CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **Auth**: JWT, bcrypt
- **Deploy**: Railway

## 📝 라이선스

MIT License
