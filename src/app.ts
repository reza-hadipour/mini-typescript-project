import express from "express"
// import * as dotenv from "dotenv"
import "dotenv/config"
import cors from "cors"
import helmet from "helmet"
import { Response, Request } from "express"
import { userRouter } from "./user/user.routes"

// dotenv.config()

if(!process.env.PORT){
    console.log(`No port value specified...`);
}

const PORT = parseInt(process.env.PORT as string,10);

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}));

app.get('/',(req: Request,res: Response)=>{
    res.jsonp({message:'Welcome to the API'})
})

app.get('/api',(req: Request,res: Response)=>{
    res.jsonp({message:'Welcome to the API'})
})

app.use(userRouter);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))