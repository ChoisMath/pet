import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Railway에서는 DATABASE_URL을 자동으로 제공
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: (process.env.NODE_ENV === 'production' || connectionString?.includes('rlwy.net')) 
    ? { rejectUnauthorized: false } 
    : false
});

// 데이터베이스 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 연결 성공');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 에러:', err);
});

// 테이블 생성 함수
export const initializeDatabase = async () => {
  try {
    // Users 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100),
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        coins INTEGER DEFAULT 100,
        upgrades JSONB DEFAULT '{"fingernail":{"level":0},"toenail":{"level":0},"fullbody":{"level":0}}'
      )
    `);

    // 기존 users 테이블의 email 컬럼에서 NOT NULL 제약조건 제거 (마이그레이션)
    await pool.query(`
      DO $$ 
      BEGIN
        BEGIN
          ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
        EXCEPTION
          WHEN others THEN NULL;
        END;
      END $$;
    `);

    // Pets 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        pet_id VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        stats JSONB DEFAULT '{"hunger":80,"happiness":80,"health":100,"energy":100,"cleanliness":90}',
        growth JSONB DEFAULT '{"stage":"baby","exp":0,"level":1}',
        state VARCHAR(20) DEFAULT 'idle',
        mood VARCHAR(20) DEFAULT 'happy',
        poop_count INTEGER DEFAULT 0,
        is_sick BOOLEAN DEFAULT FALSE,
        has_run_away BOOLEAN DEFAULT FALSE,
        position JSONB DEFAULT '{"x":150,"y":100}',
        direction INTEGER DEFAULT 1,
        jobs JSONB DEFAULT '{"delivery":{"level":0,"unlocked":false},"cleaning":{"level":0,"unlocked":false},"tutoring":{"level":0,"unlocked":false}}',
        color_id VARCHAR(20),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // jobs, color_id 컬럼이 없으면 추가 (기존 테이블 업데이트용)
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='pets' AND column_name='jobs') THEN
          ALTER TABLE pets ADD COLUMN jobs JSONB DEFAULT '{"delivery":{"level":0,"unlocked":false},"cleaning":{"level":0,"unlocked":false},"tutoring":{"level":0,"unlocked":false}}';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='pets' AND column_name='color_id') THEN
          ALTER TABLE pets ADD COLUMN color_id VARCHAR(20);
        END IF;
      END $$;
    `);

    // Inventory 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_type VARCHAR(20) NOT NULL,
        item_name VARCHAR(50) NOT NULL,
        count INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        UNIQUE(user_id, item_type, item_name)
      )
    `);

    // Game State 테이블 (알바 등 기타 상태)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_state (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        part_time_job JSONB DEFAULT '{"isWorking":false,"jobType":null,"startTime":null,"earnRate":1,"totalEarned":0}',
        game_time JSONB DEFAULT '{"day":1,"hour":12,"isNight":false}',
        assets JSONB DEFAULT '{"paperBox":{"level":0},"woodBox":{"level":0},"woodHouse":{"level":0},"plasticHouse":{"level":0},"concreteHouse":{"level":0}}',
        last_save_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        settings JSONB DEFAULT '{"soundEnabled":true,"vibrationEnabled":true}'
      )
    `);

    // assets 컬럼이 없으면 추가 (기존 테이블 업데이트용)
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='game_state' AND column_name='assets') THEN
          ALTER TABLE game_state ADD COLUMN assets JSONB DEFAULT '{"paperBox":{"level":0},"woodBox":{"level":0},"woodHouse":{"level":0},"plasticHouse":{"level":0},"concreteHouse":{"level":0}}';
        END IF;
      END $$;
    `);

    // pets 테이블에 sleep_start, energy_at_sleep_start 컬럼 추가
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='pets' AND column_name='sleep_start') THEN
          ALTER TABLE pets ADD COLUMN sleep_start BIGINT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='pets' AND column_name='energy_at_sleep_start') THEN
          ALTER TABLE pets ADD COLUMN energy_at_sleep_start FLOAT;
        END IF;
      END $$;
    `);

    console.log('✅ 데이터베이스 테이블 초기화 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 에러:', error);
    throw error;
  }
};

export default pool;
