import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username et password sont requis' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: { code: 'invalidUsername', message: 'Utilisateur incorrect' } });
        }

        if (password !== user.password) {
            return res.status(401).json({ error: { code: 'invalidPassword', message: 'Mot de passe incorrect' } });
        }

        const token = jwt.sign(
            {
                username: user.username,
                role: user.role,
                class: user.class,
                url_armory: user.url_armory,
                url_bis: user.url_bis,
                url_io: user.url_io
            },
            process.env.JWT_SECRET!);

        res.json({ token });
    } catch (error) {
        console.error('❌ Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur lors de la connexion', error });
    }
});

export default router;