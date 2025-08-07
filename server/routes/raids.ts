import express from 'express';
import { getRaids, createRaid, updateReservation, updateGroupReservation } from '../controllers/raids.controller';

const router = express.Router();

router.get('/', getRaids);
router.post('/', createRaid);
router.put('/:raidId/bosses/:bossName/loots/:lootId/reserve', updateReservation);
router.put('/group/:groupId/reserve', updateGroupReservation);

export default router;