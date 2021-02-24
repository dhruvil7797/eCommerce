import express from 'express'
import { isAuthenticated, isStoreOwner } from '../controller/auth'
import { addStore, getStore, getParticularStore, deleteStore, updateStore } from '../controller/Store'
import { validateStore } from '../helper/validate'
const router = express.Router()

/**
 * This router works for handling all the request related to the Store model. It uses two middleware
 * isAuthenticated to authenticate the token of the user and isStoreOwner to authorize the request as
 * a storeowner. It also use validateStore function to validate the store request object.
 */

/**
 * @function AddStore
 *
 * Validate store object
 *      if validated it saves the store in database and return the id of the store
 *      else return error code and error message
 *
 * @method POST
 * @URL /api/v1/Stores
 *
 * @requires AUTHENTICATION_TOKEN
 *
 * @returns id
 *
 * @success
 * 201 - New store created
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules
 * 401 - Authentication token not provided or not valid
 * 403 - User is not active or store is not active
 * 500 - Server error
 */
router.post('/Stores', isAuthenticated, validateStore, addStore);

/**
 * @function UpdateStore
 *
 * Validate store object
 *      if validated it updates the store in database and return the id of the store
 *      else return error code and error message
 *
 * @method PUT
 * @URL /api/v1/Stores/:id
 *
 * @requires AUTHENTICATION_TOKEN
 *
 * @returns id
 *
 * @success
 * 200 - Store updated
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules
 * 401 - Authentication token not provided or not valid
 * 403 - Store is deleted or user is not the owner of the store or User is deleted
 * 500 - Server error
 */
router.put('/Stores/:id', isAuthenticated, isStoreOwner, validateStore, updateStore);

/**
 * @function GetStore
 *
 * Fetch all available store in the database
 * 
 * @param {string} [q]      query string for store name
 * @param {number} [page]   page number
 *
 * @method GET
 * @URL /api/v1/Stores
 *
 * @requires NO_AUTHENTICATION
 *
 * @returns [object] data   data of all stores
 *
 * @success
 * 200 - Store data
 * 
 */
router.get('/Stores', getStore);

/**
 * @function GetParticularStore
 *
 * Fetch store with the given id
 *      if fails return error code and error message
 *
 * @param {ObjectId} [id]      id of the store
 *
 * @method GET
 * @URL /api/v1/Stores/:id
 *
 * @requires NO_AUTHENTICATION
 *
 * @returns [object] data   data of the store with given id
 *
 * @success
 * 200 - Store data
 * 
 * @error
 * 400 - No Store found with given id
 * 403 - Store deleted
 *
 */
router.get('/Stores/:id', getParticularStore);

/**
 * @function DeleteStore
 *
 * Delete the store and all items related to that store
 *
 * @param {ObjectId} [id]      id of the store
 * 
 * @method DELETE
 * @URL /api/v1/Stores/:id
 *
 * @requires AUTHENTICATION_TOKEN
 *
 * @returns id
 *
 * @success
 * 200 - Store deleted
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules
 * 401 - Authentication token not provided or not valid
 * 403 - Store is deleted or user is not the owner of the store or User is deleted
 * 500 - Server error
 */
router.delete('/Stores/:id', isAuthenticated, isStoreOwner, deleteStore);

export { router as storeRouter }