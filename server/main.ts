import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import raidsRoutes from './routes/raids';
import authRoutes from './routes/auth';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/raids', raidsRoutes);
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGODB_URI as string)
    .then(() => {
        console.log('✅ Connecté à MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Erreur de connexion MongoDB :', err);
    });