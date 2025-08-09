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
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Aucun token fourni' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
        const raids = await RaidModel.find();
        res.json(raids);
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Token invalide' });
        }
        console.error('❌ Erreur lors du chargement des raids:', error);
        res.status(500).json({ message: 'Erreur lors du chargement des raids', error });
    }
};

export const createRaid = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Aucun token fourni' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
        }

        const raidData = req.body;
        const raidDate = new Date(raidData.date);
        raidDate.setHours(20, 0, 0, 0);
        raidData.date = raidDate;

        const raid = new RaidModel(raidData);
        await raid.save();
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

    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Aucun token fourni' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
        if (decoded.username !== username) {
            return res.status(403).json({ message: 'Action réservée à l’utilisateur concerné' });
        }

        const raid = await RaidModel.findById(raidId);
        if (!raid) {
            return res.status(404).json({ message: 'Raid non trouvé' });
        }

        const boss = raid.bosses.find(b => b.name === bossName);
        if (!boss) {
            return res.status(404).json({ message: 'Boss non trouvé' });
        }

        const loot = boss.loots.find(l => l.id === lootId);
        if (!loot) {
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

        if (add && reservedCount >= 2) {
            return res.status(403).json({ message: 'Limite de 2 réservations atteinte' });
        }

        if (add) {
            if (!loot.softReservedBy.includes(username)) {
                loot.softReservedBy.push(username);
            }
        } else {
            loot.softReservedBy = loot.softReservedBy.filter((u: string) => u !== username);
        }

        await raid.save();
        const io = (req as any).io as Server;
        io.emit('raidUpdated', raid);

        res.json({ message: 'Réservation mise à jour avec succès' });
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de la réservation:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la réservation', error });
    }
};

export const updateGroupReservation = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const { bossName, itemId, username, add } = req.body;

    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Aucun token fourni' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
        if (decoded.username !== username) {
            return res.status(403).json({ message: 'Action réservée à l’utilisateur concerné' });
        }

        const raids = await RaidModel.find({ groupId: parseInt(groupId) });
        if (!raids.length) {
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

        if (add && reservedCount >= 2) {
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
                    // Ajouter une entrée dans l'historique
                    raid.history = raid.history || [];
                    raid.history.push({
                        action: 'add',
                        username,
                        timestamp: new Date(),
                        bossName,
                        itemId
                    });
                    updated = true;
                }
            } else {
                loot.softReservedBy = loot.softReservedBy.filter((u: string) => u !== username);
                // Ajouter une entrée dans l'historique
                raid.history = raid.history || [];
                raid.history.push({
                    action: 'remove',
                    username,
                    timestamp: new Date(),
                    bossName,
                    itemId
                });
                updated = true;
            }

            await raid.save();
            const io = (req as any).io as Server;
            io.emit('raidUpdated', raid);
        }

        if (!updated) {
            return res.status(404).json({ message: 'Loot ou boss non trouvé' });
        }

        res.json({ message: 'Réservation mise à jour pour le groupe avec succès' });
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de la réservation de groupe:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la réservation de groupe', error });
    }
};

export const updateDropInGroup = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Aucun token fourni' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
        }

        const { groupId } = req.params;
        const { bossName, itemId, droppedTo } = req.body;

        const raids = await RaidModel.find({ groupId });

        if (!raids.length) {
            return res.status(404).json({ message: 'Aucun raid trouvé pour ce groupe' });
        }

        let updated = false;
        for (const raid of raids) {
            const boss = raid.bosses.find(b => b.name === bossName);
            if (!boss) continue;

            const loot = boss.loots.find(l => l.itemId === itemId);
            if (!loot) continue;

            loot.droppedTo = Array.isArray(droppedTo) ? droppedTo : [];
            updated = true;
            await raid.save();

            const io = (req as any).io as Server;
            io.emit('raidUpdated', raid);
        }

        if (!updated) {
            return res.status(404).json({ message: 'Loot ou boss non trouvé' });
        }

        res.json({ message: 'Drop mis à jour pour le groupe avec succès' });
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du drop :', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du drop', error });
    }
};

export const updateReservedInGroup = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Aucun token fourni' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
        }

        const { groupId } = req.params;
        const { bossName, itemId, softReservedBy } = req.body;

        const raids = await RaidModel.find({ groupId });

        if (!raids.length) {
            return res.status(404).json({ message: 'Aucun raid trouvé pour ce groupe' });
        }

        let updated = false;
        for (const raid of raids) {
            const boss = raid.bosses.find(b => b.name === bossName);
            if (!boss) continue;

            const loot = boss.loots.find(l => l.id === itemId);
            if (!loot) continue;

            loot.softReservedBy = Array.isArray(softReservedBy) ? softReservedBy : [];
            updated = true;
            await raid.save();
            const io = (req as any).io as Server;
            io.emit('raidUpdated', raid);
        }

        if (!updated) {
            return res.status(404).json({ message: 'Loot ou boss non trouvé' });
        }

        res.json({ message: 'Réservations mises à jour pour le groupe avec succès' });
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des réservations :', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour des réservations', error });
    }
}

export const getReservationHistory = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Aucun token fourni' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
        }

        const { groupId } = req.params;
        const { bossName, itemId } = req.query as { bossName?: string; itemId?: string };

        const raids = await RaidModel.find({ groupId: parseInt(groupId) });
        if (!raids.length) {
            return res.status(404).json({ message: 'Aucun raid trouvé pour ce groupe' });
        }

        raids.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
            const dateB = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
            return dateA - dateB;
        });

        const history = (raids[0].history || []).map(entry => ({
            action: entry.action,
            username: entry.username,
            timestamp: entry.timestamp,
            bossName: entry.bossName,
            itemId: entry.itemId
        }));

        const sortedHistory = history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (typeof bossName === 'string' && typeof itemId === 'string') {
            return res.json(sortedHistory.filter(h => h.bossName === bossName && h.itemId === itemId));
        }

        res.json(sortedHistory);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'historique :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique', error });
    }
};
