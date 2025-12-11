import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ 데이터베이스 스키마가 성공적으로 생성되었습니다.');
    
    // 초기 데이터 삽입
    await insertInitialData();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 오류:', error);
    process.exit(1);
  }
}

async function insertInitialData() {
  try {
    // 기존 메뉴 확인
    const existingMenus = await pool.query('SELECT COUNT(*) as count FROM menus');
    const menuCount = parseInt(existingMenus.rows[0].count);
    
    if (menuCount > 0) {
      console.log(`ℹ️  이미 ${menuCount}개의 메뉴가 존재합니다.`);
      // 기존 메뉴 목록 출력
      const menus = await pool.query('SELECT id, name, stock FROM menus ORDER BY id');
      console.log('기존 메뉴 목록:');
      menus.rows.forEach(menu => {
        console.log(`  - ${menu.id}: ${menu.name} (재고: ${menu.stock})`);
      });
    } else {
      console.log('📝 메뉴 데이터 삽입 중...');
      // 메뉴 데이터 삽입
      const menuQuery = `
        INSERT INTO menus (name, description, price, image, stock)
        VALUES
          ('아메리카노(ICE)', '깔끔하고 진한 에스프레소에 시원한 얼음을 더한 커피', 4000, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop', 10),
          ('아메리카노(HOT)', '깔끔하고 진한 에스프레소에 뜨거운 물을 더한 커피', 4000, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop', 10),
          ('카페라떼', '부드러운 우유와 에스프레소의 조화로운 만남', 5000, 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=300&fit=crop', 10),
          ('바닐라라떼', '달콤한 바닐라 시럽이 들어간 부드러운 라떼', 5500, 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop', 10),
          ('카푸치노', '풍성한 우유 거품이 매력적인 이탈리안 커피', 5000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', 10),
          ('카라멜 마끼아또', '달콤한 카라멜과 에스프레소의 환상적인 조합', 6000, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=300&fit=crop', 10)
        RETURNING id, name, stock;
      `;
      
      const menuResult = await pool.query(menuQuery);
      console.log('✅ 메뉴 데이터가 삽입되었습니다:', menuResult.rows.length, '개');
      menuResult.rows.forEach(menu => {
        console.log(`  - ${menu.id}: ${menu.name} (재고: ${menu.stock})`);
      });
    }
    
    // 옵션 데이터 삽입 (모든 메뉴에 공통 옵션)
    const optionQuery = `
      INSERT INTO options (name, price, menu_id)
      SELECT 
        option_name,
        option_price,
        m.id
      FROM menus m
      CROSS JOIN (
        VALUES 
          ('샷 추가', 500),
          ('시럽 추가', 0)
      ) AS opts(option_name, option_price)
      WHERE NOT EXISTS (
        SELECT 1 FROM options o 
        WHERE o.menu_id = m.id AND o.name = opts.option_name
      );
    `;
    
    await pool.query(optionQuery);
    console.log('✅ 옵션 데이터가 삽입되었습니다.');
    
    console.log('✅ 초기 데이터 삽입이 완료되었습니다.');
  } catch (error) {
    // 데이터가 이미 존재하는 경우 무시
    if (error.code === '23505') {
      console.log('ℹ️  초기 데이터가 이미 존재합니다.');
    } else {
      throw error;
    }
  }
}

initDatabase();

