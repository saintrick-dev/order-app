import express from 'express';
import { getMenus, updateMenuStock } from '../controllers/menuController.js';

const router = express.Router();

// 메뉴 목록 조회
router.get('/', getMenus);

// 재고 수정
router.patch('/:menuId/stock', updateMenuStock);

export default router;

