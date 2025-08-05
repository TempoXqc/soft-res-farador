import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Raid from './models/Raid';

dotenv.config();

const REGION = 'us';
const LOCALE = 'en_US';

const fetchToken = async (): Promise<string> => {
    const res = await axios.post(`https://oauth.battle.net/token`,
        'grant_type=client_credentials',
        {
            auth: {
                username: process.env.BLIZZARD_CLIENT_ID!,
                password: process.env.BLIZZARD_CLIENT_SECRET!
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    return res.data.access_token;
};

const fetchRaid = async (instanceId: number, token: string) => {
    const url = `https://${REGION}.api.blizzard.com/data/wow/journal-instance/${instanceId}?namespace=static-${REGION}&locale=${LOCALE}&access_token=${token}`;
    return await axios.get(url);
};

const fetchLoots = async (encounterId: number, token: string) => {
    const url = `https://${REGION}.api.blizzard.com/data/wow/journal-encounter/${encounterId}?namespace=static-${REGION}&locale=${LOCALE}&access_token=${token}`;
    return await axios.get(url);
};

const importRaidData = async () => {
    const token = await fetchToken();
    await mongoose.connect(process.env.MONGO_URI!);

    const instanceId = 1208; // ID du raid à adapter (ex : Amirdrassil)
    const { data } = await fetchRaid(instanceId, token);

    const bosses = await Promise.all(
        data.encounters.map(async (encounter: any) => {
            const lootData = await fetchLoots(encounter.id, token);
            const items = lootData.data.items?.map((i: any) => ({
                itemId: i.item.id,
                name: i.item.name,
                classAllowed: i.class_restrictions || [],
                reservedBy: []
            })) || [];

            return {
                name: encounter.name,
                loots: items
            };
        })
    );

    const raid = new Raid({ date: new Date().toISOString(), bosses });
    await raid.save();
    console.log('✅ Raid importé avec succès');
    process.exit(0);
};

importRaidData().catch(err => {
    console.error('❌ Erreur lors de l’import:', err);
    process.exit(1);
});