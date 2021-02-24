import { mongoose } from "@typegoose/typegoose";
import config from "./src/config/config";
import logging from "./src/config/logging";
import app from './src/index'
import * as cron from 'node-cron';
import shipOrders from './src/helper/cronFunction'
import { fstat } from "fs";
import dotenv from 'dotenv';

dotenv.config();

/**
 * This is a setup script which runs whenever application is started. This will connect mongoDB
 * on the url that is provided in config file located at src/config. Once the mongoDB connection
 * is established it will start listening request on the port that is configured in the same 
 * config file. Once the server is running it will log into the console.
 * 
 * It will also schedule a cronjob which will executed everyday at 23:59:00 and that will call
 * a function shipOrder(). This function will fetch all the orders that are placed today and change
 * the status of orders from "Placed" to "Shipped". It also generated a CSV file at path 
 * '/src/Daily_Report/[Todays_Date].csv which contains record of all order which are shipped using
 * this function in following format
 * 
 * Order Id, Item Id, Quantity, Address Line1, Address Line2, City, Province/State, Postal/ZIP, Country
 * 
 * To start the application run following command
 * 
 * ```
 *  npm install
 *  npm start
 * ```
 * 
 */

let dailyScript = undefined;
(async () => {
    logging.info("Trying to connect at " + process.env.port, __filename);
    await mongoose.connect(config.mongo.url, config.mongo.options);
    logging.info("DB Connected at " + config.mongo.host, __filename);

    // Code cleanup
    process.on('SIGINT', cleanUp);
    process.on('exit', cleanUp);
    process.on('SIGUSR1', cleanUp);
    process.on('SIGUSR2', cleanUp);
    process.on('uncaughtException', cleanUp);

    app.listen(process.env.port, () => {
        logging.info(`Server is listening on port ${process.env.port}`, __filename);
        let maxFailAttemp = 5;
        dailyScript = cron.schedule('59 23 * * *', async () => {
            await shipOrders(maxFailAttemp);
        })
    })

})();

let cleanUp = () => {
    console.log("Cleaning up code");
    if (dailyScript) dailyScript.stop();
    mongoose.connection.close();
}

