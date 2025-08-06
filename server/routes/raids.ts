import express from 'express';
import { getRaids } from '../controllers/raids.controller';

const router = express.Router();

router.get('/', getRaids);

export default router;