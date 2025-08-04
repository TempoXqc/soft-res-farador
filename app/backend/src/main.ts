import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { DateTime } from 'luxon';
import axios, { AxiosResponse } from 'axios';
import { User, Item, Raid } from './models';

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true } as mongoose.ConnectOptions)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const BLIZZARD_CLIENT_ID = process.env.BLIZZARD_CLIENT_ID!;
const BLIZZARD_CLIENT_SECRET = process.env.BLIZZARD_CLIENT_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const REGION = 'us';
const NAMESPACE_STATIC = 'static-us';
const NAMESPACE_PROFILE = 'profile-us';
const LOCALE = 'en_US';
const RAID_INSTANCE_ID = 1302;

interface BlizzardTokenResponse {
    access_token: string;
}

async function getBlizzardToken(): Promise<string> {
    const response: AxiosResponse<BlizzardTokenResponse> = await axios.post(
        `https://${REGION}.battle.net/oauth/token`,
        null,
        {
            auth: { username: BLIZZARD_CLIENT_ID, password: BLIZZARD_CLIENT_SECRET },
            params: { grant_type: 'client_credentials' }
        }
    );
    return response.data.access_token;
}

interface JwtPayload {
    id: string;
    charName: string;
}

function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user as JwtPayload;
        next();
    });
}

function isRaidLocked(raidDate: Date): boolean {
    const now = DateTime.now().setZone('America/Montreal');
    const raidDT = DateTime.fromJSDate(raidDate).setZone('America/Montreal');
    if (now.year === raidDT.year && now.month === raidDT.month && now.day === raidDT.day && now.hour >= 18) {
        return true;
    }
    return now > raidDT;
}

app.post('/auth/register', async (req: express.Request, res: express.Response) => {
    const { charName, server, password } = req.body as { charName: string; server: string; password: string };
    const passwordHash = await bcrypt.hash(password, 10);
    try {
        const user = new User({ charName, server, passwordHash });
        await user.save();
        res.status(201).json({ message: 'User registered' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/auth/login', async (req: express.Request, res: express.Response) => {
    const { charName, server, password } = req.body as { charName: string; server: string; password: string };
    const user = await User.findOne({ charName, server });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (Object.keys(user.characterData).length === 0) {
        try {
            const token = await getBlizzardToken();
            const response = await axios.get(`https://${REGION}.api.blizzard.com/profile/wow/character/${server.toLowerCase().replace(' ', '-')}/${charName.toLowerCase()}?namespace=${NAMESPACE_PROFILE}&locale=${LOCALE}&access_token=${token}`);
            user.characterData = response.data;
            await user.save();
        } catch (err) {
            console.error('Blizzard API error:', err);
        }
    }
    const jwtToken = jwt.sign({ id: user._id.toString(), charName }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: jwtToken, characterData: user.characterData });
});

app.get('/loot/fetch', authenticateToken, async (req: express.Request, res: express.Response) => {
    try {
        const token = await getBlizzardToken();
        const instanceRes = await axios.get(`https://${REGION}.api.blizzard.com/data/wow/journal-instance/${RAID_INSTANCE_ID}?namespace=${NAMESPACE_STATIC}&locale=${LOCALE}&access_token=${token}`);
        const encounters = instanceRes.data.encounters;

        for (const encounter of encounters) {
            const encounterRes = await axios.get(`https://${REGION}.api.blizzard.com/data/wow/journal-encounter/${encounter.id}?namespace=${NAMESPACE_STATIC}&locale=${LOCALE}&access_token=${token}`);
            const items = encounterRes.data.items || [];
            for (const category of items) {
                const difficulty = category.section.name.toLowerCase();  // Approximation
                if (['normal', 'heroic', 'mythic'].includes(difficulty)) {
                    for (const item of category.items) {
                        await Item.findOneAndUpdate(
                            { itemId: item.item.id, bossId: encounter.id, difficulty },
                            { name: item.item.name, wowData: item },
                            { upsert: true }
                        );
                    }
                }
            }
        }
        res.json({ message: 'Loot fetched and stored' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Autres routes comme dans le code original (get/loot, get/bosses, get/raids, post/raids, etc.) - ajoutez-les de manière similaire avec typage TS.

app.listen(3000, () => console.log('Server running on port 3000'));