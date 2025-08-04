import * as mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    charName: { type: String, required: true, unique: true },
    server: { type: String, required: true },
    passwordHash: { type: String, required: true },
    characterData: { type: Object, default: {} }
});

const itemSchema = new mongoose.Schema({
    itemId: { type: Number, required: true },
    name: { type: String, required: true },
    bossId: { type: Number, required: true },
    difficulty: { type: String, enum: ['normal', 'heroic', 'mythic'], required: true },
    wowData: { type: Object, default: {} }
});

const raidSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    reservations: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        itemId: { type: Number, required: true }
    }]
});

export const User = mongoose.model('User', userSchema);
export const Item = mongoose.model('Item', itemSchema);
export const Raid = mongoose.model('Raid', raidSchema);