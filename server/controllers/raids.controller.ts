import { Request, Response } from 'express';
import RaidModel from '../models/Raid';

export const getRaids = async (req: Request, res: Response) => {
    try {
        const raids = await RaidModel.find();
        console.log('✅ Raids trouvés :', raids);
        res.json(raids);
    } catch (error) {
        console.error('❌ Erreur lors du chargement des raids:', error);
        res.status(500).json({ message: 'Erreur lors du chargement des raids', error });
    }
};