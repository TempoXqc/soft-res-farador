import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    console.log('Tentative de connexion avec :', { username, password });

    if (!username || !password) {
        console.log('❌ Username ou password manquant');
        return res.status(400).json({ message: 'Username et password sont requis' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('❌ Utilisateur non trouvé :', username);
            return res.status(401).json({ message: 'Utilisateur ou mot de passe incorrect' });
        }

        console.log('Utilisateur trouvé :', user);

        // Comparaison directe du mot de passe en texte clair
        if (password !== user.password) {
            console.log('❌ Mot de passe incorrect pour :', username);
            return res.status(401).json({ message: 'Utilisateur ou mot de passe incorrect' });
        }

        const token = jwt.sign(
            { username: user.username, role: user.role, class: user.class, armoryUrl: user.armoryUrl },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        console.log('✅ Connexion réussie pour :', username);
        res.json({ token });
    } catch (error) {
        console.error('❌ Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur lors de la connexion', error });
    }
});

export default router; // Export par défaut requis