import jwt from 'jsonwebtoken';
import config from "../config/config";
import { Users } from "../model/User";

/**
 * Returns user object or undefined based on the id
 *
 * @param {ObjectId} id     ObjectId for which has to find the user
 * @return {any} user       if User found   : User object
 *                          else            : undefied
 */
const getUserById = (id): any => {
    return new Promise((resolve, reject) => {
        Users.findById(id, (err, data) => {
            if (err) {
                return resolve(undefined);
            }
            resolve(data);
        });
    })
}

/**
 * Returns user object or undefined based on the email
 *
 * @param {string} email    Email for which has to find the user
 * @return {any} user       if User found   : User object
 *                          else            : undefied
 */
const getUserByEmail = (email): any => {
    return new Promise((resolve, reject) => {
        Users.find({ email: email }, (err, data) => {
            if (data.length === 0) {
                return resolve(undefined);
            }
            resolve(data);
        });
    })
}

/**
 * Returns user object or undefined based on the authentication token
 *
 * @param {string} token    jwt token
 * @return {any} user       if User found   : User object
 *                          else            : undefied
 */
const getCurrentUser = (token: string): any => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.secret, async function (err, decoded: any) {
            if (err) resolve(undefined);
            let user = await getUserById(decoded.id);
            if (!user)
                resolve(undefined);
            resolve(user);
        })
    })
}

export { getUserById, getUserByEmail, getCurrentUser };
