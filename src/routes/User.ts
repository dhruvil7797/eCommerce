import express from 'express'
import { isAuthenticated } from '../controller/auth'
import { addUser, loginUser, updateUser, addBalance, deleteUser } from '../controller/User'
import { validateUser } from '../helper/validate'
const router = express.Router()

/**
 * This router works for handling all the request related to the User model. It uses one middleware 
 * isAuthenticated to authenticate the token of the user. It also use validateUser function to 
 * validate the user request object.
 */

/**
 * @function AddUser
 *
 * Validate user object
 *      if validated it saves the user in database and return the id of the user
 *      else return error code and error message
 *
 * @method POST
 * @URL /api/v1/Users
 *
 * @requires NO_AUTHENTICATION
 * 
 * @returns id
 *
 * @success
 * 201 - New user created
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules
 * 409 - User already exist with given email address
 * 500 - Server error
 */

router.post('/Users', validateUser, addUser);


/**
 * @function UpdateUser
 *
 * Validate user object
 *      if validated it updates the user in database and return the id of the user
 *      else return error code and error message
 *
 * @method PUT
 * @URL /api/v1/Users
 *
 * @requires AUTHENTICATION_TOKEN
 * 
 * @returns id
 *
 * @success
 * 200 - User updated 
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules
 * 401 - Authentication token not provided or not valid
 * 403 - User is deleted
 * 409 - User wants to modify their email address
 * 500 - Server error
 */

router.put('/Users', isAuthenticated, validateUser, updateUser);

/**
 * @function UpdateBalance
 *
 * Validate balance argument
 *      if validated it updates the user's balance
 *      else return error code and error message
 *
 * @method PATCH
 * @URL /api/v1/Users
 * 
 * @returns id
 *
 * @requires AUTHENTICATION_TOKEN
 *
 * @success
 * 200 - User updated
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules
 * 401 - Authentication token not provided or not valid
 * 403 - User is deleted
 * 500 - Server error
 */
router.patch('/Users', isAuthenticated, addBalance);

/**
 * @function DeleteUser
 *
 * Delete the user
 *
 * @method DELETE
 * @URL /api/v1/Users
 *
 * @requires AUTHENTICATION_TOKEN
 * 
 * @returns id
 *
 * @success
 * 200 - User deleted
 *
 * @error
 * 401 - Authentication token not provided or not valid
 * 403 - User is already deleted
 * 500 - Server error
 */
router.delete('/Users', isAuthenticated, deleteUser);

/**
 * @function Login
 *
 * Validate the user credentials
 *      if validated return the auth token
 *      else return error code and error message
 *
 * @method POST
 * @URL /api/v1/Login
 *
 * @returns token
 * 
 * @success
 * 200 - Credentails are valid
 *
 * @error
 * 400 - Missing parameter or parameters does not match the validation rules
 * 403 - User is already deleted
 * 500 - Server error
 */

router.post('/Login', loginUser);

export { router as userRouter }