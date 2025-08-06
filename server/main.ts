// server/main.ts ou server/index.ts
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import raidsRoutes from './routes/raids';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/raids', raidsRoutes);

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
