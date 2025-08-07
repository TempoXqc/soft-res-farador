import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import RaidModel from '../models/Raid';
import { Server } from 'socket.io';

interface CustomJwtPayload extends JwtPayload {
    username: string;
    role: string;
    class: string;
    armoryUrl: string;
}

export const getRaids = async (req: Request, res: Response) => {
    try {
        const raids = await RaidModel.find();
        console.log('✅ Raids trouvés :', raids);
        res.json(raids);
    } catch (error) {
        console.error('❌ Erreur lors du chargement des raids:', error);
        res.status(500).json({ message: 'Erreur lors du chargement des raids', error });
    }
};

export const createRaid = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        console.log('❌ Aucun token fourni');
        return res.status(401).json({ message: 'Aucun token fourni' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
        console.log('🔐 Token décodé :', decoded);
        if (decoded.role !== 'admin') {
            console.log('❌ Utilisateur non autorisé :', { decodedUsername: decoded.username });
            return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
        }

        const raidData = req.body;
        const raid = new RaidModel(raidData);
        await raid.save();
        console.log('✅ Raid créé :', raid);

        // Emit WebSocket event
        const io = (req as any).io as Server;
        io.emit('raidCreated', raid);

        res.status(201).json({ message: 'Raid créé avec succès', raid });
    } catch (error) {
        console.error('❌ Erreur lors de la création du raid:', error);
        res.status(500).json({ message: 'Erreur lors de la création du raid', error });
    }
};

export const updateReservation = async (req: Request, res: Response) => {
    const { raidId, bossName, lootId } = req.params;
    const { username, add } = req.body;

    console.log('📥 Requête de réservation reçue :', { raidId, bossName, lootId, username, add });

    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        console.log('❌ Aucun token fourni');
        return res.status(401).json({ message: 'Aucun token fourni' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
        console.log('🔐 Token décodé :', decoded);
        if (decoded.username !== username) {
            console.log('❌ Utilisateur non autorisé :', { decodedUsername: decoded.username, requestedUsername: username });
            return res.status(403).json({ message: 'Action réservée à l’utilisateur concerné' });
        }

        const raid = await RaidModel.findById(raidId);
        if (!raid) {
            console.log('❌ Raid non trouvé :', raidId);
            return res.status(404).json({ message: 'Raid non trouvé' });
        }

        const boss = raid.bosses.find(b => b.name === bossName);
        if (!boss) {
            console.log('❌ Boss non trouvé :', { raidId, bossName });
            return res.status(404).json({ message: 'Boss non trouvé' });
        }

        const loot = boss.loots.find(l => l.id === lootId);
        if (!loot) {
            console.log('❌ Loot non trouvé :', { raidId, bossName, lootId });
            return res.status(404).json({ message: 'Loot non trouvé' });
        }

        // Count user's reservations
        let reservedCount = 0;
        for (const b of raid.bosses) {
            for (const item of b.loots) {
                if (item.softReservedBy.includes(username)) {
                    reservedCount++;
                }
            }
        }
        console.log('📊 Nombre de réservations de l’utilisateur :', reservedCount);

        if (add && reservedCount >= 2) {
            console.log('❌ Limite de 2 réservations atteinte pour :', username);
            return res.status(403).json({ message: 'Limite de 2 réservations par raid atteinte' });
        }

        if (add) {
            if (!loot.softReservedBy.includes(username)) {
                loot.softReservedBy.push(username);
                console.log('✅ Ajout de la réservation :', { username, lootId });
            }
        } else {
            loot.softReservedBy = loot.softReservedBy.filter((u: string) => u !== username);
            console.log('✅ Suppression de la réservation :', { username, lootId });
        }

        await raid.save();
        console.log('✅ Réservation mise à jour :', raid);

        // Emit WebSocket event
        const io = (req as any).io as Server;
        io.emit('raidUpdated', raid);

        res.json({ message: 'Réservation mise à jour avec succès', raid });
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de la réservation:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la réservation', error });
    }
};

export const updateGroupReservation = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const { bossName, itemId, username, add } = req.body;

    console.log('📥 Requête de réservation de groupe reçue :', { groupId, bossName, itemId, username, add });

    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        console.log('❌ Aucun token fourni');
        return res.status(401).json({ message: 'Aucun token fourni' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
        console.log('🔐 Token décodé :', decoded);
        if (decoded.username !== username) {
            console.log('❌ Utilisateur non autorisé :', { decodedUsername: decoded.username, requestedUsername: username });
            return res.status(403).json({ message: 'Action réservée à l’utilisateur concerné' });
        }

        const raids = await RaidModel.find({ groupId: parseInt(groupId) });
        if (!raids.length) {
            console.log('❌ Groupe non trouvé :', groupId);
            return res.status(404).json({ message: 'Groupe non trouvé' });
        }

        // Compter les réservations dans le premier raid du groupe
        const firstRaid = raids[0];
        let reservedCount = 0;
        for (const b of firstRaid.bosses) {
            for (const item of b.loots) {
                if (item.softReservedBy.includes(username)) {
                    reservedCount++;
                }
            }
        }
        console.log('📊 Nombre de réservations de l’utilisateur :', reservedCount);

        if (add && reservedCount >= 2) {
            console.log('❌ Limite de 2 réservations atteinte pour :', username);
            return res.status(403).json({ message: 'Limite de 2 réservations par groupe atteinte' });
        }

        // Mettre à jour tous les raids du groupe
        let updated = false;
        for (const raid of raids) {
            const boss = raid.bosses.find(b => b.name === bossName);
            if (!boss) continue;

            const loot = boss.loots.find(l => l.itemId === itemId);
            if (!loot) continue;

            if (add) {
                if (!loot.softReservedBy.includes(username)) {
                    loot.softReservedBy.push(username);
                    console.log('✅ Ajout de la réservation :', { username, itemId });
                    updated = true;
                }
            } else {
                loot.softReservedBy = loot.softReservedBy.filter((u: string) => u !== username);
                console.log('✅ Suppression de la réservation :', { username, itemId });
                updated = true;
            }

            await raid.save();
            console.log('✅ Raid mis à jour dans le groupe :', raid._id);

            // Émettre l'événement WebSocket
            const io = (req as any).io as Server;
            io.emit('raidUpdated', raid);
        }

        if (!updated) {
            console.log('❌ Aucun loot ou boss correspondant trouvé pour :', { bossName, itemId });
            return res.status(404).json({ message: 'Loot ou boss non trouvé' });
        }

        res.json({ message: 'Réservation mise à jour pour le groupe avec succès' });
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de la réservation de groupe:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la réservation de groupe', error });
    }
};