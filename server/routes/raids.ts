import { Router } from 'express';
import Raid from '../models/Raid';

const router = Router();

router.get('/', async (_, res) => {
    const raids = await Raid.find();
    res.json(raids);
});

router.post('/', async (req, res) => {
    const { date, bosses } = req.body;
    const raid = new Raid({ date, bosses });
    await raid.save();
    res.json(raid);
});

export default router;