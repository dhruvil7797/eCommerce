import { NextFunction, Request, Response } from 'express'
import logging from '../config/logging';
import { rw } from '../helper/helperFunction';
import jwt from 'jsonwebtoken'
import config from '../config/config';
import { getCurrentUser, getUserById } from '../helper/User';
import { getStoreById } from '../helper/Store';

/**
 * Return an error or call the next function by checking the authentication of the user
 *
 * @param {Request} request             Request object that will be sent by client
 * @param {Response} response           Response object that will be sent to client
 * @param {NextFunction} next           Function that needs to be called if user is authorized
 *
 */
const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    logging.info("Checking authentication of user", __filename);

    var token = req.get('x-access-token');

    if (!token) return res.status(401).send(rw(__filename, false, "No token provided"));

    jwt.verify(token, config.secret, async function (err, decoded: any) {
        if (err) return res.status(401).send(rw(__filename, false, "Failed to authenticate token"));
        let user = await getUserById(decoded.id);
        if (!user)
            return res.status(401).send(rw(__filename, false, "Token corrupted"));
        if (!user.isActive)
            return res.status(403).send(rw(__filename, false, "User is not active"));
        next();
    })
}

/**
 * Return an error or call the next function by checking the authorization of the user as storeowner
 *
 * @param {Request} request             Request object that will be sent by client
 * @param {Response} response           Response object that will be sent to client
 * @param {NextFunction} next           Function that needs to be called if user is the owner of the store
 *
 */
const isStoreOwner = async (req: Request, res: Response, next: NextFunction) => {
    logging.info("Checking ownership", __filename);

    let storeId = req.originalUrl.includes("/Item") ? req.query.storeId || req.body.storeId : req.params.id;

    if (!storeId)
        return res.status(400).send(rw(__filename, false, "No store id was provided"));

    let currentUser = await getCurrentUser(req.get('x-access-token'));

    let store = await getStoreById(storeId);

    if (!store)
        return res.status(400).send(rw(__filename, false, "No store exist with given id"));
    if (!store.isActive)
        return res.status(403).send(rw(__filename, false, "Store is not active"));
    if (new String(store.ownerId).valueOf() != new String(currentUser._id).valueOf())
        return res.status(403).send(rw(__filename, false, "Only owner of this store can modify details"));
    next();
}

export { isAuthenticated, isStoreOwner }