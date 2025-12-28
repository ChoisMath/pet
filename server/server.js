import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool, { initializeDatabase } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정 - 여러 origin 허용
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // 서버 간 요청이나 같은 origin 요청 허용
      if (!origin) return callback(null, true);
      
      // Railway 도메인 허용 (.up.railway.app)
      if (origin.endsWith('.up.railway.app')) {
        return callback(null, true);
      }
      
      // 허용된 origin 목록에 있는지 확인
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // 개발 환경에서는 localhost 허용
      if (origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      
      callback(new Error('CORS not allowed'));
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check 엔드포인트 (Railway 헬스체크용)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Tamagotchi API Server is running!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "인증이 필요합니다." });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "fallback-secret",
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
      }
      req.user = user;
      next();
    }
  );
};

// ===== 인증 라우트 =====

// 회원가입
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 유효성 검사
    if (!username || !email || !password) {
      return res.status(400).json({ error: "모든 필드를 입력해주세요." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "비밀번호는 6자 이상이어야 합니다." });
    }

    // 중복 확인
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "이미 존재하는 사용자명 또는 이메일입니다." });
    }

    // 비밀번호 해시
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 사용자 생성
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, passwordHash]
    );

    const user = result.rows[0];

    // 초기 인벤토리 생성
    const initialItems = [
      ["food", "apple", 3, 1],
      ["food", "meat", 2, 1],
      ["food", "cookie", 1, 1],
      ["medicine", "pill", 2, 1],
    ];

    for (const [itemType, itemName, count, level] of initialItems) {
      await pool.query(
        "INSERT INTO inventory (user_id, item_type, item_name, count, level) VALUES ($1, $2, $3, $4, $5)",
        [user.id, itemType, itemName, count, level]
      );
    }

    // 초기 게임 상태 생성
    await pool.query("INSERT INTO game_state (user_id) VALUES ($1)", [user.id]);

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "회원가입 성공!",
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error("회원가입 에러:", error);
    res.status(500).json({ error: "서버 에러가 발생했습니다." });
  }
});

// 로그인
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "사용자명과 비밀번호를 입력해주세요." });
    }

    // 사용자 찾기
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "잘못된 사용자명 또는 비밀번호입니다." });
    }

    const user = result.rows[0];

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "잘못된 사용자명 또는 비밀번호입니다." });
    }

    // 마지막 로그인 시간 업데이트
    await pool.query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id]
    );

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "로그인 성공!",
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error("로그인 에러:", error);
    res.status(500).json({ error: "서버 에러가 발생했습니다." });
  }
});

// 현재 사용자 정보
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, coins, upgrades, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("사용자 정보 조회 에러:", error);
    res.status(500).json({ error: "서버 에러가 발생했습니다." });
  }
});

// ===== 게임 데이터 라우트 =====

// 게임 데이터 불러오기
app.get("/api/game/load", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 사용자 정보
    const userResult = await pool.query(
      "SELECT coins, upgrades FROM users WHERE id = $1",
      [userId]
    );

    // 펫 정보
    const petsResult = await pool.query(
      "SELECT * FROM pets WHERE user_id = $1 AND has_run_away = FALSE",
      [userId]
    );

    // 인벤토리
    const inventoryResult = await pool.query(
      "SELECT item_type, item_name, count, level FROM inventory WHERE user_id = $1",
      [userId]
    );

    // 게임 상태
    const gameStateResult = await pool.query(
      "SELECT * FROM game_state WHERE user_id = $1",
      [userId]
    );

    // 인벤토리 구조화
    const inventory = {
      food: {},
      medicine: {},
      toys: {},
    };

    for (const item of inventoryResult.rows) {
      if (!inventory[item.item_type]) {
        inventory[item.item_type] = {};
      }
      inventory[item.item_type][item.item_name] = {
        count: item.count,
        level: item.level,
        basePrice: getBasePrice(item.item_type, item.item_name),
      };
    }

    // 펫 데이터 변환
    const pets = petsResult.rows.map((pet) => ({
      id: pet.pet_id,
      type: pet.type,
      name: pet.name,
      createdAt: new Date(pet.created_at).getTime(),
      stats: pet.stats,
      growth: pet.growth,
      state: pet.state,
      mood: pet.mood,
      position: pet.position,
      direction: pet.direction,
      poopCount: pet.poop_count,
      isSick: pet.is_sick,
      hasRunAway: pet.has_run_away,
      lastFed: new Date(pet.last_updated).getTime(),
      lastPlayed: new Date(pet.last_updated).getTime(),
      specialActivity: null,
      activityProgress: 0,
    }));

    const gameState = gameStateResult.rows[0] || {};
    const user = userResult.rows[0];

    res.json({
      coins: user?.coins || 100,
      upgrades: user?.upgrades || {
        fingernail: { level: 0, maxLevel: 20, baseCost: 100, coinPerClick: 1 },
        toenail: { level: 0, maxLevel: 20, baseCost: 1000, coinPerClick: 5 },
        fullbody: { level: 0, maxLevel: 20, baseCost: 10000, coinPerClick: 20 },
      },
      pets,
      selectedPetId: pets[0]?.id || null,
      inventory,
      partTimeJob: gameState.part_time_job || { isWorking: false },
      gameTime: gameState.game_time || { day: 1, hour: 12, isNight: false },
      lastSaveTime: gameState.last_save_time
        ? new Date(gameState.last_save_time).getTime()
        : Date.now(),
      settings: gameState.settings || {
        soundEnabled: true,
        vibrationEnabled: true,
      },
    });
  } catch (error) {
    console.error("게임 데이터 불러오기 에러:", error);
    res.status(500).json({ error: "서버 에러가 발생했습니다." });
  }
});

// 게임 데이터 저장
app.post("/api/game/save", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      coins,
      upgrades,
      pets,
      inventory,
      partTimeJob,
      gameTime,
      settings,
    } = req.body;

    // 트랜잭션 시작
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 사용자 정보 업데이트
      await client.query(
        "UPDATE users SET coins = $1, upgrades = $2 WHERE id = $3",
        [coins, JSON.stringify(upgrades), userId]
      );

      // 기존 펫 삭제 후 새로 저장
      await client.query("DELETE FROM pets WHERE user_id = $1", [userId]);

      for (const pet of pets) {
        await client.query(
          `
          INSERT INTO pets (user_id, pet_id, type, name, stats, growth, state, mood, poop_count, is_sick, has_run_away, position, direction, last_updated)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
        `,
          [
            userId,
            pet.id,
            pet.type,
            pet.name,
            JSON.stringify(pet.stats),
            JSON.stringify(pet.growth),
            pet.state,
            pet.mood,
            pet.poopCount,
            pet.isSick,
            pet.hasRunAway,
            JSON.stringify(pet.position),
            pet.direction,
          ]
        );
      }

      // 인벤토리 업데이트
      for (const [itemType, items] of Object.entries(inventory)) {
        if (typeof items === "object" && items !== null) {
          for (const [itemName, itemData] of Object.entries(items)) {
            if (typeof itemData === "object" && itemData !== null) {
              await client.query(
                `
                INSERT INTO inventory (user_id, item_type, item_name, count, level)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_id, item_type, item_name)
                DO UPDATE SET count = $4, level = $5
              `,
                [
                  userId,
                  itemType,
                  itemName,
                  itemData.count || 0,
                  itemData.level || 1,
                ]
              );
            }
          }
        }
      }

      // 게임 상태 업데이트
      await client.query(
        `
        INSERT INTO game_state (user_id, part_time_job, game_time, settings, last_save_time)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id)
        DO UPDATE SET part_time_job = $2, game_time = $3, settings = $4, last_save_time = CURRENT_TIMESTAMP
      `,
        [
          userId,
          JSON.stringify(partTimeJob),
          JSON.stringify(gameTime),
          JSON.stringify(settings),
        ]
      );

      await client.query("COMMIT");
      res.json({ message: "저장 성공!" });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("게임 저장 에러:", error);
    res.status(500).json({ error: "서버 에러가 발생했습니다." });
  }
});

// ===== 헬퍼 함수 =====
function getBasePrice(itemType, itemName) {
  const prices = {
    food: { apple: 10, meat: 25, cookie: 15 },
    medicine: { pill: 50 },
  };
  return prices[itemType]?.[itemName] || 10;
}

// 서버 시작
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("서버 시작 실패:", error);
    process.exit(1);
  }
};

startServer();
