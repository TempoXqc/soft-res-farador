import express, { Request, Response } from 'express';
import User from '../models/User';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await User.find({}, { username: 1, _id: 0 });
        console.log('✅ Utilisateurs trouvés :', users);
        res.json(users);
    } catch (error) {
        console.error('❌ Erreur lors du chargement des utilisateurs :', error);
        res.status(500).json({ message: 'Erreur lors du chargement des utilisateurs', error });
    }
});

export default router;