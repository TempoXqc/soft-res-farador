// ✅ server/models/Raid.ts
import mongoose from 'mongoose';

const LootSchema = new mongoose.Schema({
    itemName: String,
    slot: String,
    softReservedBy: [String]
}, { _id: false });

const BossSchema = new mongoose.Schema({
    name: String,
    loots: [LootSchema]
}, { _id: false });

const RaidSchema = new mongoose.Schema({
    name: String,
    difficulty: String,
    date: Date,
    bosses: [BossSchema]
});

const RaidModel = mongoose.model('Raid', RaidSchema);
export default RaidModel;