import { Items } from "../model/Item";
import { getStoreById } from "./Store";
import { getCurrentUser } from "./User";

/**
 * Returns item object or undefined based on the id
 *
 * @param {ObjectId} id     ObjectId for which has to find the item
 * @return {any} item       if item found   : Item object
 *                          else            : undefied
 */

const getItemById = (id): any => {
    return new Promise((resolve, reject) => {
        Items.findById(id, (err, data) => {
            if (err) {
                return resolve(undefined);
            }
            if (data.isActive)
                resolve(data);
            else
                resolve(undefined);
        });
    })
}

/**
 * Returns true is user is owner of the store when item is available else false
 *
 * @param {ObjectId} itemId     ObjectId for which has to find the item
 * @param {string} token        jwt token
 * @return {any} isOwner        is Owner of the store where item is available
 * 
 */
const isItemOwner = (itemId, token) => {
    return new Promise(async (resolve, reject) => {
        let item = await getItemById(itemId);
        if (item) {
            let store = await getStoreById(item.storeId);
            let currentUser = await getCurrentUser(token);
            if (new String(store.ownerId).valueOf() != new String(currentUser._id).valueOf())
                resolve(false);
            resolve(true);
        }
        resolve(undefined);
    });
}

export { getItemById, isItemOwner };
