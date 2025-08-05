import { Router } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || typeof user.password !== 'string') {
        return res.status(401).json({ message: 'Utilisateur introuvable ou mot de passe invalide' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Mot de passe incorrect' });

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

    res.json({ token });
});


export default router;