import express from 'express'
import { isAuthenticated, isStoreOwner } from '../controller/auth'
import { deleteOrder, deleteOrderForItem, placeOrder } from '../controller/Order'
import { validateOrder } from '../helper/validate'
const router = express.Router()

/**
 * This router works for handling all the request related to the Order model. It uses one middleware
 * isAuthenticated to authenticate the token of the user. It also use validateOrder function to 
 * validate the order request object.
 */

/**
 * @function PlaceOrder
 *
 * Validate order object
 *      if validated it checks for the available balance
 *      if balance is sufficient it checks for the available quantity
 *      if quantity is available it will place the order deduct the amount from the user balance
 *          reduce the available quantity
 *      else rollback the transaction
 *
 * @method POST
 * @URL /api/v1/Order
 *
 * @requires AUTHENTICATION_TOKEN
 *
 * @returns id
 *
 * @success
 * 201 - New order placed
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules or insufficient quantity
 * 401 - Authentication token not provided or not valid
 * 403 - User is not active or insufficient balance or invalid item
 * 500 - Server error
 */

router.post('/Orders', isAuthenticated, validateOrder, placeOrder);

/**
 * @function DeleteOrderForItem
 *
 * Delete all the orders for a particular item where status is "Placed"
 *
 * @param {ObjectId} [id]      id of the item
 *
 * @method DELETE
 * @URL /api/v1/Order/Item/:id
 *
 * @requires AUTHENTICATION_TOKEN
 *
 * @returns id
 *
 * @success
 * 200 - Order deleted
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules
 * 401 - Authentication token not provided or not valid
 * 403 - User is deleted or Store is deleted or User is not owner of store
 */
router.delete('/Orders/Items/:id', isAuthenticated, deleteOrderForItem);

/**
 * @function DeleteOrder
 *
 * Delete the order and refund the amount
 *
 * @param {ObjectId} [id]      id of the order
 *
 * @method DELETE
 * @URL /api/v1/Order/:id
 *
 * @requires AUTHENTICATION_TOKEN
 *
 * @returns id
 *
 * @success
 * 200 - Order deleted
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules
 * 401 - Authentication token not provided or not valid
 * 403 - User is deleted
 */
router.delete('/Orders/:id', isAuthenticated, deleteOrder);

export { router as orderRouter }