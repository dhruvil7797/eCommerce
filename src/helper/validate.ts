import { plainToClass } from 'class-transformer';
import { isInt, validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import logging from '../config/logging';
import { Item } from '../model/Item';
import { Store } from '../model/Store';
import { User } from '../model/User';
import { rw } from './helperFunction';

/**
 * Validate user object and if validated call the next function
 *
 * @param {Request} req         Requst object send by client
 * @param {Response} res        Response object will be sent to client
 * @param {NextFunction} next  Next function that will be executed if object validated
 * 
 */

const validateUser = async (req: Request, res: Response, next: NextFunction) => {
    logging.info("Validating User Schema", __filename);
    const user = plainToClass(User, req.body);
    validate(user.address, config.defaultValidation)
        .then(errors => {
            if (errors.length > 0) {
                return res.status(400).send(rw(__filename, false, 'Address validation failed with errors: ' + errors))
            } else {
                validate(user, config.defaultValidation)
                    .then(errors => {
                        if (errors.length > 0) {
                            return res.status(400).send(rw(__filename, false, 'User validation failed with errors: ' + errors))
                        } else {
                            next();
                        }
                    });
            }
        });
}

/**
 * Validate store object and if validated call the next function
 *
 * @param {Request} req         Requst object send by client
 * @param {Response} res        Response object will be sent to client
 * @param {NextFunction} next  Next function that will be executed if object validated
 *
 */
const validateStore = async (req: Request, res: Response, next: NextFunction) => {
    logging.info("Validating Store Schema", __filename);
    const store = plainToClass(Store, req.body);
    validate(store.address, config.defaultValidation)
        .then(errors => {
            if (errors.length > 0) {
                return res.status(400).send(rw(__filename, false, 'Address validation failed with errors: ' + errors))
            } else {
                validate(store, config.defaultValidation)
                    .then(errors => {
                        if (errors.length > 0) {
                            return res.status(400).send(rw(__filename, false, 'Store validation failed with errors: ' + errors))
                        } else {
                            next();
                        }
                    });
            }
        });
}

/**
 * Validate item object and if validated call the next function
 *
 * @param {Request} req         Requst object send by client
 * @param {Response} res        Response object will be sent to client
 * @param {NextFunction} next  Next function that will be executed if object validated
 *
 */
const validateItem = async (req: Request, res: Response, next: NextFunction) => {
    logging.info("Validating Item Schema", __filename);
    const item = plainToClass(Item, req.body);
    validate(item, config.defaultValidation)
        .then(errors => {
            if (errors.length > 0) {
                return res.status(400).send(rw(__filename, false, 'Item validation failed with errors: ' + errors))
            } else {
                next();
            }
        });
}


/**
 * Validate order object and if validated call the next function
 *
 * @param {Request} req         Requst object send by client
 * @param {Response} res        Response object will be sent to client
 * @param {NextFunction} next  Next function that will be executed if object validated
 *
 */
const validateOrder = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.items == undefined || req.body.items.length < 1)
        return res.status(400).send(rw(__filename, false, "Required minimum 1 item to place an order"));
    let items = req.body.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].id == undefined) {
            return res.status(400).send(rw(__filename, false, "Each item's quantity must be provided"));
        }
        if (items[i].qty == undefined) {
            return res.status(400).send(rw(__filename, false, "Each item's quantity must be provided"));
        }
        if (items[i].qty < 1 || !isInt(items[i].qty)) {
            return res.status(400).send(rw(__filename, false, "Item's quantity must be a positive number"));
        }
    }
    next();
}

export { validateUser, validateStore, validateItem, validateOrder };
