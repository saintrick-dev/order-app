import pool from '../config/database.js';

export const getMenus = async (req, res) => {
  try {
    // 메뉴 조회
    const menusResult = await pool.query(
      'SELECT id, name, description, price, image, stock FROM menus ORDER BY id'
    );

    console.log(`📋 메뉴 조회: ${menusResult.rows.length}개 발견`);

    // 메뉴가 없는 경우
    if (menusResult.rows.length === 0) {
      console.warn('⚠️ 데이터베이스에 메뉴가 없습니다. 초기화가 필요합니다.');
      return res.json({
        success: true,
        data: [],
      });
    }

    // 각 메뉴의 옵션 조회
    const menus = await Promise.all(
      menusResult.rows.map(async (menu) => {
        const optionsResult = await pool.query(
          'SELECT id, name, price FROM options WHERE menu_id = $1 ORDER BY id',
          [menu.id]
        );

        return {
          id: menu.id,
          name: menu.name,
          description: menu.description || '',
          price: menu.price,
          image: menu.image || '',
          stock: menu.stock || 0,
          options: optionsResult.rows || [],
        };
      })
    );

    console.log(`✅ ${menus.length}개 메뉴 반환 (옵션 포함)`);

    res.json({
      success: true,
      data: menus,
    });
  } catch (error) {
    console.error('❌ 메뉴 조회 오류:', error);
    console.error('에러 상세:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '메뉴 조회 중 오류가 발생했습니다.',
        details: error.message,
      },
    });
  }
};

export const updateMenuStock = async (req, res) => {
  try {
    const { menuId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '재고 수량은 0 이상이어야 합니다.',
        },
      });
    }

    const result = await pool.query(
      'UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, stock',
      [quantity, menuId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MENU_NOT_FOUND',
          message: '메뉴를 찾을 수 없습니다.',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('재고 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '재고 수정 중 오류가 발생했습니다.',
      },
    });
  }
};

