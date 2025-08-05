import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import raidRoutes from './routes/raids';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/raids', raidRoutes);

mongoose.connect(process.env.MONGODB_URI!)
    .then(() => {
        console.log('MongoDB connecté');
        app.listen(PORT, () => console.log(`Serveur actif sur http://localhost:${PORT}`));
    })
    .catch((err) => console.error('Erreur de connexion MongoDB:', err));