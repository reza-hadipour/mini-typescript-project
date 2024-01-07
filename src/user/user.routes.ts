import express,{Request,Response} from 'express';
import {UnitUser,Users} from './user.interface'
import {StatusCodes} from 'http-status-codes';
import * as database from './user.database';

export const userRouter = express.Router();

userRouter.get("/users", async (req: Request,res: Response)=>{
    try {
        const allUsers : UnitUser[] = await database.findAll();

        if(!allUsers) return res.status(StatusCodes.NOT_FOUND).json({msg: "No users at this time."})
        console.log(allUsers);
        return res.status(StatusCodes.OK).json({total_user : allUsers.length, allUsers})

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

userRouter.get('/user/:id',async (req: Request,res: Response)=>{
    try {
        const user : UnitUser = await database.findOne(req.params.id)

        if(!user) return res.status(StatusCodes.NOT_FOUND).json({msg: "User not found."})

        return res.status(StatusCodes.OK).json({user});
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

userRouter.post('/register',async (req,res)=>{
    try {
        const {username, email, password} = req.body;

        if(!username || !email || !password){
            return res.status(StatusCodes.BAD_REQUEST).json({error: 'Please provide all the required parameters.'})
        }

        const user = await database.findByEmail(email);
        if(user) return res.status(StatusCodes.BAD_REQUEST).json({error: 'This email has already been registered...'})

        const newUser = await database.create(req.body);

        return res.status(StatusCodes.CREATED).json({newUser})

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

userRouter.post('/login',async(req,res)=>{
    try {
        const {email,password} = req.body;

        if(!email || !password) return res.status(StatusCodes.BAD_REQUEST).json({error: 'Please provide all the required parameters.'})

        const user = await database.findByEmail(email);
        if(!user) return res.status(StatusCodes.NOT_FOUND).json({error: "No user exists with this email."})

        const comparingPassword = await database.comparePassword(user.password,password);
        
        if(comparingPassword){
            return res.status(StatusCodes.OK).json({user});
        }else{
            return res.status(StatusCodes.BAD_REQUEST).json({error : `Incorrect Password!`})
        }

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

userRouter.put('/user/:id', async (req,res)=>{
    try {
        
        if("email" in req.body){
            delete req.body["email"];
        }

        const {username, password} = req.body;

        if( !username && !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({error: `Please provide all the required parameters..`})
        }

        const updatedUser = await database.update(req.params.id, req.body);
        
        if(!updatedUser){
            return res.status(StatusCodes.NOT_FOUND).json({msg: "User not found."})
        }

        return res.status(StatusCodes.CREATED).json({updatedUser});

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

userRouter.delete('/user/:id', async (req,res)=>{
    try {
        let deleteResult = await database.remove(req.params.id);
        if(deleteResult){
            return res.status(StatusCodes.OK).json({msg: "User deleted successfully!"})
        }else{
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({error: "User not found."})
        }
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})