import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import config from '../config/config';
import { rw } from '../helper/helperFunction';
import { getCurrentUser } from '../helper/User';
import { Items } from '../model/Item';
import { Store, Stores } from '../model/Store';

/**
 * Handle the request for adding a new store to the database
 *
 * @param {Request} request         Request object send by client
 * @param {Response} response       Response object that will be sent to client
 *
 */
const addStore = async (req: Request, res: Response) => {
    const store: Store = plainToClass(Store, req.body);
    const currentUser = await getCurrentUser(req.get('x-access-token'));
    store.updatedBy = store.createdBy = store.ownerId = currentUser._id;
    Stores.create(store)
        .then((data: any) => res.status(201).send(rw(__filename, true, null, { id: data._id })))
        .catch((error: any) => res.status(500).send(rw(__filename, false, error)))
}

/**
 * Handle the request for getting list of all store from the database
 *
 * @param {Request} request         Request object send by client
 * @param {Response} response       Response object that will be sent to client
 *
 */
const getStore = async (req: Request, res: Response) => {

    let page = parseInt(req.query.page as string)
    page = isNaN(page) || page < 0 ? 0 : page;

    var regex = new RegExp("" + req.query.q);
    let queryString = req.query.q === undefined ? { isActive: true } :
        { "name": { $regex: regex, $options: 'i' }, isActive: true };

    let totalRecord = await Stores.count(
        queryString
    ).exec();

    let data = await Stores.find(
        queryString, config.hideStoreAdmin
    ).skip(page * config.pageLimit).limit(config.pageLimit).exec();

    return res.status(200).send(rw(__filename, true, null, {
        totalRecord: totalRecord,
        totalPage: Math.ceil(totalRecord / config.pageLimit),
        count: data.length,
        record: data
    }));
}


/**
 * Handle the request for getting a particular store from the database
 *
 * @param {Request} request         Request object send by client
 * @param {Response} response       Response object that will be sent to client
 *
 */
const getParticularStore = async (req: Request, res: Response) => {
    var id = req.params.id;
    Stores.findById(id, config.hideStoreAdmin).exec()
        .then((store: any) => {
            if (store.isActive)
                return res.status(200).send(rw(__filename, true, "Store found", store))
            else
                return res.status(403).send(rw(__filename, false, "Store is not active"))
        })
        .catch((error: any) => {
            return res.status(400).send(rw(__filename, false, "No store found with given store id"));
        })
}

/**
 * Handle the request for deleting a particular store from the database
 *
 * @param {Request} request         Request object send by client
 * @param {Response} response       Response object that will be sent to client
 *
 */
const deleteStore = async (req: Request, res: Response) => {
    Items.updateMany({ storeId: req.params.id }, { $set: { isActive: false } })
        .then((data) => {
            Stores.findByIdAndUpdate(req.params.id, { $set: { isActive: false } })
                .then((store: any) => {
                    return res.status(200).send(rw(__filename, true, "Store and all its item are deleted", { id: store._id }));
                })
                .catch((error: any) => {
                    return res.status(500).send(rw(__filename, false, "Error while deleting the store"));
                })
        })
        .catch((error: any) => {
            return res.status(500).send(rw(__filename, false, "Error while deleting the items from the store"));
        })

}

/**
 * Handle the request for updating a store from the database
 *
 * @param {Request} request         Request object send by client
 * @param {Response} response       Response object that will be sent to client
 *
 */
const updateStore = async (req: Request, res: Response) => {
    const currentUser: any = await getCurrentUser(req.get('x-access-token'));
    Stores.findById(req.params.id).exec()
        .then((store: any) => {
            const updatedStore: Store = plainToClass(Store, req.body);
            updatedStore.createdBy = store.createdBy;
            updatedStore.updatedBy = currentUser._id;
            Stores.findByIdAndUpdate(req.params.id, updatedStore).exec()
                .then((data: any) => res.status(200).send(rw(__filename, true, "Store updated", data)))
                .catch((error: any) => res.status(500).send(rw(__filename, false, error)))

        })
        .catch((error: any) => {
            return res.send(rw(__filename, false, "No store found with given store id"));
        })
}

export { addStore, getStore, getParticularStore, deleteStore, updateStore };

