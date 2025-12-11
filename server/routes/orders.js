import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = express.Router();

// 주문 생성
router.post('/', createOrder);

// 주문 목록 조회
router.get('/', getOrders);

// 주문 상세 조회
router.get('/:orderId', getOrderById);

// 주문 상태 업데이트
router.patch('/:orderId/status', updateOrderStatus);

export default router;

