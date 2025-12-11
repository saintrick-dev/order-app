-- 데이터베이스 생성 (필요한 경우)
-- CREATE DATABASE cozy_coffee;

-- Menus 테이블
CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image VARCHAR(500),
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Options 테이블
CREATE TABLE IF NOT EXISTS options (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders 테이블
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  total_price INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OrderItems 테이블
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INTEGER REFERENCES menus(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  options JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_options_menu_id ON options(menu_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_id ON order_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_time ON orders(order_time DESC);

