import mongoose from 'mongoose';

const LootSchema = new mongoose.Schema({
    itemId: Number,
    name: String,
    classAllowed: [String],
    reservedBy: [String]
});

const BossSchema = new mongoose.Schema({
    name: String,
    loots: [LootSchema]
});

const RaidSchema = new mongoose.Schema({
    date: String,
    bosses: [BossSchema]
});

export default mongoose.model('Raid', RaidSchema);