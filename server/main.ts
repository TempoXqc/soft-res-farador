// main.ts
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import raidRoutes from './routes/raids';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST', 'PUT']
    }
});

app.use((req: Request, res: Response, next: NextFunction) => {
    (req as any).io = io;
    next();
});

app.use(cors());
app.use(express.json());
app.use('/api/raids', raidRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

mongoose.set('strictQuery', true);

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('❌ MONGODB_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch((err: Error) => {
        console.error('❌ Erreur de connexion à MongoDB:', err);
        process.exit(1);
    });

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`🚀 Serveur démarré sur le port ${port}`)).on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use. Please free the port or choose another one.`);
        process.exit(1);
    } else {
        console.error('❌ Erreur lors du démarrage du serveur:', err);
        process.exit(1);
    }
});