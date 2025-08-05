import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    class: String,
    role: String,
    armoryUrl: String
});

export default mongoose.model('User', UserSchema);