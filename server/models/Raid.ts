import mongoose from 'mongoose';

const LootSchema = new mongoose.Schema({
    itemName: String,
    slot: String,
    softReservedBy: [String],
    itemId: String,
    id: String,
    classAllowed: [String],
    iconUrl: String
}, { _id: false });

const BossSchema = new mongoose.Schema({
    name: String,
    loots: [LootSchema],
    iconUrl: String
}, { _id: false });

const RaidSchema = new mongoose.Schema({
    name: String,
    difficulty: String,
    date: Date,
    bosses: [BossSchema],
    groupId: Number
});

const RaidModel = mongoose.model('Raid', RaidSchema);
export default RaidModel;