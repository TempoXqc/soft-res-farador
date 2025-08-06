import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Raid from './models/Raid';

dotenv.config();

const REGION = 'us';
const LOCALE = 'en_US';

const fetchToken = async (): Promise<string> => {
    const res = await axios.post(
        `https://oauth.battle.net/token`,
        'grant_type=client_credentials',
        {
            auth: {
                username: '3e4f8e91d89a4abb87287cd41119e2a0',
                password: '3iR4ee16rzgSq0rcDHIlIxyeL42Ke4jm'
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
    );
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

const getItemDetails = async (itemId: number, token: string) => {
    const url = `https://${REGION}.api.blizzard.com/data/wow/item/${itemId}?namespace=static-${REGION}&locale=${LOCALE}&access_token=${token}`;
    return await axios.get(url);
};

const getItemMedia = async (itemId: number, token: string) => {
    const url = `https://${REGION}.api.blizzard.com/data/wow/media/item/${itemId}?namespace=static-${REGION}&locale=${LOCALE}&access_token=${token}`;
    return await axios.get(url);
};

const getEncounterMedia = async (encounterId: number, token: string) => {
    const url = `https://${REGION}.api.blizzard.com/data/wow/media/journal-encounter/${encounterId}?namespace=static-${REGION}&locale=${LOCALE}&access_token=${token}`;
    return await axios.get(url);
};

const importRaidData = async () => {
    try {
        const token = await fetchToken();
        await mongoose.connect(process.env.MONGODB_URI!);

        const instanceId = 1302; // ✅ Replace with the correct ID from getJournalInstances.ts (likely 1302)
        const { data } = await fetchRaid(instanceId, token);

        const bosses = await Promise.all(
            data.encounters.map(async (encounter: any) => {
                const lootData = await fetchLoots(encounter.id, token);
                const items = await Promise.all(
                    (lootData.data.items || []).map(async (i: any) => {
                        const itemDetails = await getItemDetails(i.item.id, token);
                        const itemData = itemDetails.data;

                        const itemMedia = await getItemMedia(i.item.id, token);
                        const iconUrl = itemMedia.data.assets.find((a: any) => a.key === 'icon')?.value || 'Unknown';

                        const qualityMap = { POOR: 0, COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5 };
                        const quality = qualityMap[itemData.quality.type] || 3;

                        return {
                            itemId: i.item.id,
                            itemName: i.item.name,
                            slot: itemData.inventory_type.name || 'Unknown',
                            softReservedBy: [],
                            classAllowed: i.limit?.class_restrictions?.map((c: any) => c.name) || [],
                            iconUrl,
                            description: itemData.description || '',
                            stats: itemData.preview_item.stats?.map((s: any) => ({
                                type: s.type.name,
                                amount: s.amount
                            })) || [],
                            effects: itemData.preview_item.spells?.map((s: any) => ({
                                description: s.description
                            })) || [],
                            quality
                        };
                    })
                );

                const encounterMedia = await getEncounterMedia(encounter.id, token);
                const bossIconUrl = encounterMedia.data.assets.find((a: any) => a.key === 'image')?.value || 'Unknown';

                return {
                    name: encounter.name,
                    loots: items,
                    bossIconUrl
                };
            })
        );

        const raid = new Raid({
            name: data.name,
            difficulty: 'Normal', // Adjust as needed
            date: new Date(),
            bosses
        });

        await raid.save();
        console.log('✅ Raid Manaforge Omega imported with icons and details');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during import:', err);
        process.exit(1);
    }
};

importRaidData();