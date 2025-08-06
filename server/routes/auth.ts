import { Router } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    try {
        const user = await User.findOne({ username });
        console.log('User found:', user);

        if (!user || typeof user.password !== 'string') {
            console.log('User not found or invalid password field:', { username });
            return res.status(401).json({ message: 'Utilisateur introuvable ou mot de passe invalide' });
        }

        const valid = password === user.password;
        console.log('Password valid:', valid);
        if (!valid) {
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }

        const token = jwt.sign(
            {
                username: user.username,
                role: user.role,
                class: user.class,
                armoryUrl: user.armoryUrl
            },
            process.env.JWT_SECRET!,
            { expiresIn: '12h' }
        );

        console.log('Login successful, token generated:', token);
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la connexion', error });
    }
});

export default router;