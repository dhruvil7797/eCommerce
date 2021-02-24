import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import config from '../config/config'
import { rw } from '../helper/helperFunction'
import { isItemOwner } from '../helper/Item'
import { getStoreById } from '../helper/Store'
import { getCurrentUser } from '../helper/User'
import { Item, Items } from '../model/Item'


/**
 * Handle the request to add an Item to the database
 *
 * @param {Request} request             Request object that will be sent by client
 * @param {Response} response           Response object that will be sent to client
 *
 */
const addItem = async (req: Request, res: Response) => {
    const item: Item = plainToClass(Item, req.body);
    const currentUser = await getCurrentUser(req.get('x-access-token'));
    item.updatedBy = item.createdBy = currentUser._id;
    Items.create(item)
        .then((data: any) => {
            return res.status(201).send(rw(__filename, true, "Item created", { id: data._id }))
        })
        .catch((error: any) => {
            return res.status(500).send(rw(__filename, false, "error while creating item"))
        })
}

/**
 * Handle the request to get list of Items from the database
 *
 * @param {Request} request             Request object that will be sent by client
 * @param {Response} response           Response object that will be sent to client
 * 
 */
const getItem = async (req: Request, res: Response) => {

    let page = parseInt(req.query.page as string)
    page = isNaN(page) || page < 0 ? 0 : page;

    let storeIdQuery = req.query.storeId as string;

    let store = await getStoreById(storeIdQuery);

    if (!store) {
        return res.status(400).send(rw(__filename, false, "Store id invalid"));
    }

    let queryString = req.query.q === undefined || req.query.q == "" ? { isActive: true, storeId: storeIdQuery } :
        { $text: { $search: "" + req.query.q || "" }, isActive: true, storeId: storeIdQuery };

    try {
        let totalRecord = await Items.count(queryString).exec();

        let data = await Items.find(
            queryString
        ).skip(page * config.pageLimit).limit(config.pageLimit).exec();

        return res.status(200).send(rw(__filename, true, null, {
            totalRecord: totalRecord,
            totalPage: Math.ceil(totalRecord / config.pageLimit),
            count: data.length,
            record: data
        }));
    }
    catch (error) {
        res.status(500).send(rw(__filename, false, "Error while fetching items"));
    }
}


/**
 * Handle the request to get an Items from the database with a particular id
 *
 * @param {Request} request             Request object that will be sent by client
 * @param {Response} response           Response object that will be sent to client
 *
 */
const getParticularItem = async (req: Request, res: Response) => {
    var id = req.params.id;
    Items.findById(id, config.hideStoreAdmin).exec()
        .then((item: any) => {
            if (item.isActive)
                return res.status(200).send(rw(__filename, true, null, item))
            else
                return res.status(403).send(rw(__filename, false, "Item is deleted from the store"))
        })
        .catch((error: any) => {
            return res.status(400).send(rw(__filename, false, "No Item found with given item id"));
        })
}

/**
 * Handle the request to delete an Items from the database with a particular id
 *
 * @param {Request} request             Request object that will be sent by client
 * @param {Response} response           Response object that will be sent to client
 *
 */
const deleteItem = async (req: Request, res: Response) => {
    var id = req.params.id;
    let authorization = await isItemOwner(id, req.get('x-access-token'))

    if (authorization === undefined)
        return res.status(400).send(rw(__filename, false, "No Item found with given item id"));
    else if (authorization === false)
        return res.status(403).send(rw(__filename, false, "Only owner of this store can modify this store"));
    Items.findByIdAndUpdate(id, { $set: { isActive: false } })
        .then((store: any) => {
            return res.status(200).send(rw(__filename, true, "Item deleted", { id: id }));
        })
        .catch((error: any) => {
            return res.status(500).send(rw(__filename, false, "Error while deleting the item"));
        })
}

/**
 * Handle the request to update an Items from the database with a particular id
 *
 * @param {Request} request             Request object that will be sent by client
 * @param {Response} response           Response object that will be sent to client
 *
 */
const updateItem = async (req: Request, res: Response) => {
    const currentUser = await getCurrentUser(req.get('x-access-token'));
    Items.findById(req.params.id).exec()
        .then((item: any) => {
            const updatedItem: Item = plainToClass(Item, req.body);
            updatedItem.createdBy = item.createdBy;
            updatedItem.updatedBy = currentUser._id;
            Items.findByIdAndUpdate(req.params.id, updatedItem).exec()
                .then((data: any) => res.status(200).send(rw(__filename, true, "Item updated", data)))
                .catch((error: any) => res.status(500).send(rw(__filename, false, error)))

        })
        .catch((error: any) => {
            return res.status(400).send(rw(__filename, false, "No Item found with given id"));
        })
}


export { addItem, getItem, getParticularItem, deleteItem, updateItem }

