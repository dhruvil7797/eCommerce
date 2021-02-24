import { Stores } from "../model/Store";

/**
 * Returns store object or undefined based on the id
 *
 * @param {ObjectId} id     ObjectId for which has to find the store
 * @return {any} store      if Store found  : Store object
 *                          else            : undefied
 */
const getStoreById = (id): any => {
    return new Promise((resolve, reject) => {
        Stores.findById(id, (err, data) => {
            if (err) {
                return resolve(undefined);
            }
            resolve(data);
        });
    })
}

export { getStoreById };
