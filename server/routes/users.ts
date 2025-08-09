import express, { Request, Response } from 'express';
import User from '../models/User';
import jwt from "jsonwebtoken";

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await User.find({}, { username: 1, class: 1, _id: 0 });
        res.json(users);
    } catch (error) {
        console.error('❌ Erreur lors du chargement des utilisateurs :', error);
        res.status(500).json({ message: 'Erreur lors du chargement des utilisateurs', error });
    }
});

router.get('/me', async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Aucun token fourni' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { username: string };

        const user = await User.findOne({ username: decoded.username }, { username: 1, class: 1, role: 1, url_armory: 1, url_bis: 1, url_io: 1, _id: 0 });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(user);
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Token invalide' });
        }
        console.error('❌ Erreur lors de la récupération de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error });
    }
});

router.get('/:username', async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ username: req.params.username }, { username: 1, class: 1, _id: 0 });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

export default router;