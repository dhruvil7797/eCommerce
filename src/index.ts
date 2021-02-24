import express from 'express'
import { json } from 'body-parser'
import { userRouter } from './routes/User'
import { itemRouter } from './routes/Item'
import { storeRouter } from './routes/Store'
import { orderRouter } from './routes/Order'
import { rw } from './helper/helperFunction'

/**
 * This is a defualt router page which will import all module routers and generate a common express
 * component for it. That is exported which can be used when setting up the server. This router will
 * involve userRouter, itemRouter, storeRouter, orderRouter. It will also use body-parser to pass json
 * body from the request object. This application is the v1 for the product so all api can be access
 * using prepath 'api/v1'. 
 * 
 * There is also a default handler for all the request which is not provided into the routes. So, it
 * user enters wrong url that will be handle using this handler.
 * 
 * rw is a helper function that is used to generate a response and also log that response into the console.
 * It accept four parameters
 * 
 * @param {string} fileName -   Name of the file from where the funcion is called. 
 *                              You can use __filename to use the default path of the file.
 * @param {boolean} success     This indicate whether request is process successfully or not
 * @param {any} [message]       This provides the message either success message or error message
 * @param {any} [data]          This provides the data that will be send as a response
 */

const app = express();
app.use(json());
app.use("/api/v1", [userRouter, itemRouter, storeRouter, orderRouter]);

app.use(function (req, res, next) {
    res.send(rw(__filename, false, "Invalid url"));
})

export default app;