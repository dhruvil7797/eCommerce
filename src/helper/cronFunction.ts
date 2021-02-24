import * as csv from 'csv-writer';
import * as fs from 'fs';
import config from '../config/config';
import logging from '../config/logging';
import { OrderItems, Orders } from '../model/Order';

/**
 * This function will be executed at every day at 23:59:00 and change the status of the orders
 * that are placed on that day from placed to shipped
 */

export default async function shipOrder(maxFailAttemp: number) {

    // path variable generate the path where the csv file will be stored based on todays date
    let path = `src/Daily_Report/${new Date().toLocaleDateString()}.csv`;

    // create an empty file where data will be stored
    fs.writeFile(path, '', async function (err) {

        if (err) {
            if (maxFailAttemp === 0) {
                return logging.error("Max attemp reached fail to run the schedule job", __filename);
            }
            logging.error("Fail to run the schedule job : Trying again", __filename)
            return shipOrder(maxFailAttemp - 1);     // Try to run the scheduler again
        }

        // Once the file is created initialize object of csvwriter
        const createCSVWriter = csv.createObjectCsvWriter;
        const csvWriter = createCSVWriter({
            path: path,
            header: config.csvHeader,
        })

        // Generate timeduration for which the order needs to be shipped
        let prevDate = new Date();
        prevDate.setDate(prevDate.getDate() - 1);

        // Fetch all the orders who is placed between given timerange
        let data = await OrderItems.find({ createdAt: { $gte: prevDate, $lt: new Date() }, status: 'Placed' });

        let todayUpdate = [];   // array to store json object which will be written into the csv file
        for (let i = 0; i < data.length; i++) {
            // For each item generate the json object
            let order = await Orders.findById(data[i].orderId);
            let jsonObject = {
                orderId: data[i].orderId,
                itemId: data[i].itemId,
                qty: data[i].qty,
                add1: order.address.addressLine1,
                add2: order.address.addressLine2 || "",
                city: order.address.city,
                province: order.address.province,
                postal: order.address.postalCode,
                country: order.address.country
            }

            // Change the status to shipped
            await OrderItems.findByIdAndUpdate(data[i]._id, { $set: { status: 'Shipped' } });
            todayUpdate.push(jsonObject);
        }

        // Write all order to csv file
        csvWriter.writeRecords(todayUpdate)
            .then(() => {
                logging.info("Daily report generated at location : " + path, __filename);
            })

    })
}