import {User,UnitUser,Users} from "./user.interface"
import bcrypt from 'bcrypt';
import {v4 as random} from 'uuid';
import fs from 'fs';

let users: Users = loadUsers()

function loadUsers () : Users {
    try {
        const data = fs.readFileSync("./users.json","utf-8")
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error %c${error}`,"red");
        return {}
    }
}

function saveUsers () {
    try {
        fs.writeFileSync("./users.json", JSON.stringify(users),"utf-8")
        console.log('User saved successfully!')
    } catch (error) {
        console.error(`Error %c${error}`,"red")
    }
}

export const findAll = async (): Promise<UnitUser[]> => Object.values(users)

export const findOne = async (id: string) : Promise<UnitUser | null> => users[id]

export const create = async (userData: UnitUser) : Promise<UnitUser | null> => {
    let id = random();

    let check_user = await findOne(id);

    while(check_user){
        id = random();
        check_user = await findOne(id);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password,salt);

    const user : UnitUser = {
        id: id,
        username: userData.username,
        email: userData.email,
        password : hashedPassword
    };

    users[id] = user;

    saveUsers();
    
    return user;
}

export const findByEmail = async (user_email : string): Promise<UnitUser | null> => {
    const allUser = await findAll();
    const getUser = allUser.find(result => user_email === result.username);

    if(!getUser) return null;

    return getUser
}

export const comparePassword = async (email: string, supplied_password: string) : Promise<UnitUser | null> => {
    const user = await findByEmail(email);
    const decryptPassword = await bcrypt.compare(supplied_password,user!.password);
    
    if(!decryptPassword) return null;

    return user;
}

export const update = async (id: string, updateValues: User) : Promise<UnitUser|null> => {
    const userExists = await findOne(id);

    if(!userExists){
        return null
    }

    if(updateValues.password){
        const salt = await bcrypt.genSalt(10);
        const newPass = await bcrypt.hash(updateValues.password, salt);
    }

    users[id] = {
        ...userExists,
        ...updateValues
    }

    console.log('Updated User:', users[id]);

    saveUsers();

    return users[id]
}

export const remove = async (id: string) : Promise<null | void> => {
    const user = await findOne(id);
    if(!user) return null;

    delete users[id];

    saveUsers();
}

// DON`T DO THIS!!
// function errorHandler( func: Function) : any {
//     try {
//         func();
//     } catch (error) {
//         console.error(`Error %c${error}`,"red");
//     }
// }