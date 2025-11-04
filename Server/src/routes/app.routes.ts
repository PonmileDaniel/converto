import { Router } from 'express';
import { AppController } from '../controllers/app.controller';

const router = Router();
const appController = new AppController();

router.get('/', appController.getAppInfo);

export default router;