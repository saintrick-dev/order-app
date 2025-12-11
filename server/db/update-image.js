import pool from '../config/database.js';

async function updateMenuImage() {
  try {
    // 아메리카노(ICE) 메뉴의 이미지 업데이트
    const result = await pool.query(
      `UPDATE menus 
       SET image = $1 
       WHERE name = $2 
       RETURNING id, name, image`,
      ['americano-ice.jpg', '아메리카노(ICE)']
    );

    if (result.rows.length === 0) {
      console.log('⚠️  아메리카노(ICE) 메뉴를 찾을 수 없습니다.');
      console.log('현재 메뉴 목록:');
      const menus = await pool.query('SELECT id, name FROM menus ORDER BY id');
      menus.rows.forEach(menu => {
        console.log(`  - ${menu.id}: ${menu.name}`);
      });
    } else {
      console.log('✅ 이미지가 성공적으로 업데이트되었습니다:');
      result.rows.forEach(menu => {
        console.log(`  - ID: ${menu.id}, 이름: ${menu.name}, 이미지: ${menu.image}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 이미지 업데이트 오류:', error);
    process.exit(1);
  }
}

updateMenuImage();

