import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js';

export const updateUser = async (req, res, next) =>{
    if (req.user.id!==req.params.id) next(errorHandler(401, 'Unauthorized'));

    try {
        if(req.body.password)req.body.password = bcryptjs.hashSync(req.body.password, 10);

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            {
                $set: { //never put $set:req.body for security issues
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    avatar: req.body.avatar
                }
            },
            {
                new:true //return user with new info 
            }
        );

        const {password, ...rest} = updatedUser._doc;

        res.status(200).json({
            success: true,
            message: "User updated successfully!",
            user: rest
        });
    } catch (error) {
        next(error);
    }
}

export const deleteUser = async (req, res, next) =>{
    if (req.user.id!==req.params.id) return next(errorHandler(401, "You can only delete your own account!"));
        
    try {
        await User.findByIdAndDelete(req.params.id);
        res.clearCookie('access_token');
        res.status(200).json({
            success: true,
            message: "User has been deleted successfully!"
        });
    } catch (error) {
        next(error);
    }
    
}