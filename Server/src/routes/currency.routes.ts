import { Router } from "express";
import { CurrencyController } from "../controllers/currency.controller";

const router = Router();
const currencyController = new CurrencyController();

router.get('/convert', currencyController.convert);
router.get('/providers', currencyController.getProviderStatus);

export default router;