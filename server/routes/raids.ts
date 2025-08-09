import express from 'express';
import {
    getRaids,
    createRaid,
    updateReservation,
    updateGroupReservation,
    updateDropInGroup, updateReservedInGroup, getReservationHistory
} from '../controllers/raids.controller';

const router = express.Router();

router.get('/', getRaids);
router.post('/', createRaid);
router.put('/:raidId/bosses/:bossName/loots/:lootId/reserve', updateReservation);
router.put('/group/:groupId/reserve', updateGroupReservation);
router.put('/group/:groupId/drop', updateDropInGroup);
router.put('/group/:groupId/reserved', updateReservedInGroup);
router.get('/group/:groupId/history', getReservationHistory);

export default router;