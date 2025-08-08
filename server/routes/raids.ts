import express from 'express';
import {
    getRaids,
    createRaid,
    updateReservation,
    updateGroupReservation,
    updateDropInGroup
} from '../controllers/raids.controller';

const router = express.Router();

router.get('/', getRaids);
router.post('/', createRaid);
router.put('/:raidId/bosses/:bossName/loots/:lootId/reserve', updateReservation);
router.put('/group/:groupId/reserve', updateGroupReservation);
router.put('/group/:groupId/drop', updateDropInGroup);

export default router;