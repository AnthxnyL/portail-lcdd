import express from 'express';
const router = express.Router();
import { createDiscountCode, getDiscountCodeByName, getSalesByDiscountCode, deleteDiscountCode } from '../controllers/shopifyController.js';

router.post('/discount-code', createDiscountCode);
router.get('/get-code/:code', getDiscountCodeByName);
router.get('/sales/:code', getSalesByDiscountCode)
router.delete('/delete-code/:code', deleteDiscountCode);

export default router;
