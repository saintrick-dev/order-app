import pool from '../config/database.js';

export const createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { items, totalPrice } = req.body;

    // 입력 검증
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '주문 항목이 필요합니다.',
        },
      });
    }

    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '주문 총 금액이 올바르지 않습니다.',
        },
      });
    }

    await client.query('BEGIN');

    // 재고 확인 및 주문 생성
    for (const item of items) {
      const menuResult = await client.query(
        'SELECT id, name, stock FROM menus WHERE id = $1',
        [item.menuId]
      );

      if (menuResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: {
            code: 'MENU_NOT_FOUND',
            message: `메뉴 ID ${item.menuId}를 찾을 수 없습니다.`,
          },
        });
      }

      const menu = menuResult.rows[0];
      if (menu.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `${menu.name}의 재고가 부족합니다. (현재: ${menu.stock}개, 요청: ${item.quantity}개)`,
          },
        });
      }
    }

    // 주문 생성
    const orderResult = await client.query(
      'INSERT INTO orders (order_time, status, total_price) VALUES (CURRENT_TIMESTAMP, $1, $2) RETURNING id, order_time, status, total_price',
      ['PENDING', totalPrice]
    );

    const order = orderResult.rows[0];

    // 주문 항목 저장 및 재고 감소
    for (const item of items) {
      const optionPrice = item.options?.reduce((sum, opt) => sum + opt.price, 0) || 0;
      const menuResult = await client.query('SELECT price FROM menus WHERE id = $1', [item.menuId]);
      const menuPrice = menuResult.rows[0].price;
      const unitPrice = menuPrice + optionPrice;

      // 주문 항목 저장
      await client.query(
        'INSERT INTO order_items (order_id, menu_id, quantity, unit_price, options) VALUES ($1, $2, $3, $4, $5)',
        [order.id, item.menuId, item.quantity, unitPrice, JSON.stringify(item.options || [])]
      );

      // 재고 감소
      await client.query(
        'UPDATE menus SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.menuId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        id: order.id,
        orderTime: order.order_time,
        status: order.status,
        totalPrice: order.total_price,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('주문 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '주문 생성 중 오류가 발생했습니다.',
      },
    });
  } finally {
    client.release();
  }
};

export const getOrders = async (req, res) => {
  try {
    // 주문 목록 조회 (최신순)
    const ordersResult = await pool.query(
      'SELECT id, order_time, status, total_price FROM orders ORDER BY order_time DESC'
    );

    // 각 주문의 항목 조회
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(
          `SELECT 
            oi.id,
            oi.menu_id as "menuId",
            m.name as "menuName",
            oi.quantity,
            oi.unit_price as "unitPrice",
            oi.options
          FROM order_items oi
          JOIN menus m ON oi.menu_id = m.id
          WHERE oi.order_id = $1
          ORDER BY oi.id`,
          [order.id]
        );

        return {
          id: order.id,
          orderTime: order.order_time,
          status: order.status,
          totalPrice: order.total_price,
          items: itemsResult.rows.map((item) => {
            // options가 JSONB 문자열인 경우 파싱
            let options = item.options || [];
            if (typeof options === 'string') {
              try {
                options = JSON.parse(options);
              } catch (e) {
                console.error('옵션 파싱 오류:', e);
                options = [];
              }
            }
            return {
              id: item.id,
              menuId: item.menuId,
              menuName: item.menuName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              options: options,
            };
          }),
        };
      })
    );

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('주문 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '주문 목록 조회 중 오류가 발생했습니다.',
      },
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 주문 조회
    const orderResult = await pool.query(
      'SELECT id, order_time, status, total_price FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: '주문을 찾을 수 없습니다.',
        },
      });
    }

    const order = orderResult.rows[0];

    // 주문 항목 조회
    const itemsResult = await pool.query(
      `SELECT 
        oi.id,
        oi.menu_id as "menuId",
        m.name as "menuName",
        oi.quantity,
        oi.unit_price as "unitPrice",
        oi.options
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      WHERE oi.order_id = $1
      ORDER BY oi.id`,
      [order.id]
    );

    res.json({
      success: true,
      data: {
        id: order.id,
        orderTime: order.order_time,
        status: order.status,
        totalPrice: order.total_price,
        items: itemsResult.rows.map((item) => ({
          id: item.id,
          menuId: item.menuId,
          menuName: item.menuName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          options: item.options || [],
        })),
      },
    });
  } catch (error) {
    console.error('주문 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '주문 조회 중 오류가 발생했습니다.',
      },
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PREPARING', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: '유효하지 않은 주문 상태입니다.',
        },
      });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: '주문을 찾을 수 없습니다.',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '주문 상태 업데이트 중 오류가 발생했습니다.',
      },
    });
  }
};

