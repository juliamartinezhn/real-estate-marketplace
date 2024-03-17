import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type:String,
        require: true,
        unique: true
    },
    email: {
        type:String,
        require: true,
        unique: true
    },
    password: {
        type:String,
        require: true
    },
    avatar: {
        type: String,
        default: "https://st3.depositphotos.com/19428878/36416/v/450/depositphotos_364169666-stock-illustration-default-avatar-profile-icon-vector.jpg"
    }
}, { timestamps:true });

const User = mongoose.model('User', userSchema);

export default User;