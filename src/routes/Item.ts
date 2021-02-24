import express from 'express'
import { isAuthenticated, isStoreOwner } from '../controller/auth'
import { addItem, deleteItem, getItem, getParticularItem, updateItem } from '../controller/Item'
import { validateItem } from '../helper/validate'
const router = express.Router()

/**
 * This router works for handling all the request related to the Item model. It uses two middleware
 * isAuthenticated to authenticate the token of the user, isStoreOwner to authorize the request as
 * a storeowner. It also use validateItem function to validate the item request object.
 */

/**
 * @function AddItem
 *
 * Validate item object
 *      if validated it saves the item in database and return the id of the item
 *      else return error code and error message
 *
 * @method POST
 * @URL /api/v1/Items
 *
 * @requires AUTHENTICATION_TOKEN
 *
 * @returns id
 *
 * @success
 * 201 - New item created
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules
 * 401 - Authentication token not provided or not valid
 * 403 - User is not active, store is deleted or not a store owner
 * 500 - Server error
 */
router.post('/Items', isAuthenticated, isStoreOwner, validateItem, addItem);

/**
 * @function UpdateItem
 *
 * Validate item object
 *      if validated it updates the item in database and return the id of the item
 *      else return error code and error message
 *
 * @method PUT
 * @URL /api/v1/Items/:id
 *
 * @requires AUTHENTICATION_TOKEN
 *
 * @returns id
 *
 * @success
 * 200 - Item updated
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules
 * 401 - Authentication token not provided or not valid
 * 403 - Store is deleted or user is not the owner of the store or User is deleted
 * 500 - Server error
 */
router.put('/Items/:id', isAuthenticated, isStoreOwner, validateItem, updateItem);

/**
 * @function GetItem
 *
 * Fetch all available store in the database
 *
 * @param {string} [q]          query string for store name
 * @param {number} [page]       page number
 * @param {ObjectId} storeId    StoreId for which items need to be fetched
 *
 * @method GET
 * @URL /api/v1/Items
 *
 * @requires NO_AUTHENTICATION
 *
 * @returns [object] data   data of all items for a particular store
 *
 * @success
 * 200 - Item data
 * 
 * @error
 * 400 - Invalid store id
 * 500 - Server error
 *
 */
router.get('/Items', getItem);

/**
 * @function GetParticularItem
 *
 * Fetch item with the given id
 *      if fails return error code and error message
 *
 * @param {ObjectId} [id]      id of the item
 *
 * @method GET
 * @URL /api/v1/Items/:id
 *
 * @requires NO_AUTHENTICATION
 *
 * @returns [object] data   data of the item with given id
 *
 * @success
 * 200 - Item data
 *
 * @error
 * 400 - No item found
 * 403 - Item deleted
 *
 */
router.get('/Items/:id', getParticularItem);

/**
 * @function DeleteItem
 *
 * Delete the item from the databse
 *
 * @param {ObjectId} [id]      id of the item
 *
 * @method DELETE
 * @URL /api/v1/Items/:id
 *
 * @requires AUTHENTICATION_TOKEN
 *
 * @returns id
 *
 * @success
 * 200 - Item deleted
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules
 * 401 - Authentication token not provided or not valid
 * 403 - Store is deleted or user is not the owner of the store or User is deleted
 * 500 - Server error
 */
router.delete('/Items/:id', isAuthenticated, deleteItem);

export { router as itemRouter }