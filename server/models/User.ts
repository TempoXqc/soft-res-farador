import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    class: String,
    role: String,
    url_armory: String,
    url_bis: String,
    url_io: String
});

export default mongoose.model('User', UserSchema);