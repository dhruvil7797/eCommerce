import bcrypt from 'bcryptjs';
import { plainToClass } from 'class-transformer';
import { isPositive } from 'class-validator';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { rw } from '../helper/helperFunction';
import { getCurrentUser, getUserByEmail } from '../helper/User';
import { User, Users } from '../model/User';

/**
 * Handle the request for adding a new user to the database
 *
 * @param {Request} request         Request object send by client
 * @param {Response} response       Response object that will be sent to client
 * 
 */
const addUser = async (req: Request, res: Response) => {
    const user = await getUserByEmail(req.body.email);
    if (user) return res.status(409).send(rw(__filename, false, "User already exist with given email address"));

    let userObj: User = plainToClass(User, req.body);
    userObj.password = bcrypt.hashSync(req.body.password);
    Users.create(userObj)
        .then((data) => {
            return res.status(201).send(rw(__filename, true, "New user created", { id: data._id }))
        })
        .catch((error) => {
            return res.status(500).send(rw(__filename, false, "Error while creating the user", error))
        })
}

/**
 * Handle the request for allowing a user to login
 *
 * @param {Request} request         Request object send by client
 * @param {Response} response       Response object that will be sent to client
 *
 */
const loginUser = async (req: Request, res: Response) => {

    if (!req.body.email || !req.body.password)
        return res.status(400).send(rw(__filename, false, "User id or password not provided"));

    let user = await getUserByEmail(req.body.email);

    if (!user)
        return res.status(400).send(rw(__filename, false, "No user found with given email address"));

    user = user[0];
    if (!user.isActive)
        return res.status(403).send(rw(__filename, false, "User is not active"));

    let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid)
        return res.status(400).send(rw(__filename, false, "Invalid credentials"));

    let token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
    });
    return res.status(200).send(rw(__filename, true, "Credential validated", { token: token }));
}

/**
 * Handle the request for updating a user
 *
 * @param {Request} request         Request object send by client
 * @param {Response} response       Response object that will be sent to client
 *
 */
const updateUser = async (req: Request, res: Response) => {

    let currentUser = await getCurrentUser(req.get('x-access-token'));

    let userObj: User = plainToClass(User, req.body);

    if (currentUser.email != userObj.email)
        return res.status(409).send(rw(__filename, false, "You cannot modify email address"));

    userObj.password = bcrypt.hashSync(req.body.password);
    Users.findByIdAndUpdate(currentUser.id, userObj)
        .then((data) => {
            return res.status(200).send(rw(__filename, true, "User updated", { id: data._id }))
        })
        .catch((error) => {
            return res.status(500).send(rw(__filename, false, "Error while updating user", error))
        })
}

/**
 * Handle the request for adding balance into user account
 *
 * @param {Request} request         Request object send by client
 * @param {Response} response       Response object that will be sent to client
 *
 */
const addBalance = async (req: Request, res: Response) => {
    let currentUser = await getCurrentUser(req.get('x-access-token'));
    let balance = req.body.balance;
    if (balance === undefined)
        return res.status(400).send(rw(__filename, false, "Missing argument balance"))
    if (!isPositive(balance))
        return res.status(400).send(rw(__filename, false, "Balance must be a positive integer"))

    currentUser.balance = currentUser.balance + balance;
    Users.findByIdAndUpdate(currentUser._id, currentUser)
        .then((data) => {
            return res.status(200).send(rw(__filename, true, "Balance updated", { id: data._id }))
        })
        .catch((error) => {
            return res.status(500).send(rw(__filename, false, "Error while updating balance", error))
        })

}


/**
 * Handle the request for deleting a user
 *
 * @param {Request} request         Request object send by client
 * @param {Response} response       Response object that will be sent to client
 *
 */

const deleteUser = async (req: Request, res: Response) => {
    let currentUser = await getCurrentUser(req.get('x-access-token'));

    currentUser.isActive = false;

    Users.findByIdAndUpdate(currentUser._id, currentUser)
        .then((data) => {
            return res.status(200).send(rw(__filename, true, "User deleted", { id: data._id }))
        })
        .catch((error) => {
            return res.status(500).send(rw(__filename, false, "Error while deleting user", error))
        })
}



export { addUser, loginUser, updateUser, addBalance, deleteUser };
