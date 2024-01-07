import {User,UnitUser,Users} from "./user.interface"
import bcrypt from 'bcryptjs';
import {v4 as random} from 'uuid';
import * as fs from 'fs';

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
        fs.writeFileSync("./users.json", JSON.stringify(users),{encoding:"utf-8"})
        
        console.log('User saved successfully!')
    } catch (error) {
        console.error(`Error %c${error}`,"red")
    }
}

export const findAll = async (): Promise<UnitUser[]> => Object.values(users)

export const findOne = async (id: string) : Promise<UnitUser> => users[id]

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
    const getUser = allUser.find(result => user_email === result.email);

    if(!getUser) return null;

    return getUser
}

export const comparePassword = async (encryptedPass: string, supplied_password: string) : Promise<Boolean> => {
    // const user = await findByEmail(email);
    // if(!user) return null;

    const decryptPassword = await bcrypt.compare(supplied_password,encryptedPass);
    return decryptPassword;
}

export const update = async (id: string, updateValues: User) : Promise<UnitUser|null> => {
    const userExists = await findOne(id);

    if(!userExists){
        return null
    }

    if(updateValues.password){
        const salt = await bcrypt.genSalt(10);
        const newPass = await bcrypt.hash(updateValues.password, salt);
        updateValues.password = newPass
    }

    // if("username" in updateValues){
    //     delete updateValues["username"];
    // }
        

    users[id] = {
        ...userExists,
        ...updateValues
    }

    console.log('Updated User:', users[id]);

    saveUsers();

    return users[id]
}

export const remove = async (id: string) : Promise<boolean> => {
    const user = await findOne(id);
    if(!user) return false;

    delete users[id];

    saveUsers();

    return true;
}

// DON`T DO THIS!!
// function errorHandler( func: Function) : any {
//     try {
//         func();
//     } catch (error) {
//         console.error(`Error %c${error}`,"red");
//     }
// }