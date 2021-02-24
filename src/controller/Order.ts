import { mongoose } from '@typegoose/typegoose';
import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import logging from '../config/logging';
import { rw } from '../helper/helperFunction';
import { getItemById } from '../helper/Item';
import { getStoreById } from '../helper/Store';
import { getCurrentUser, getUserById } from '../helper/User';
import { Address } from '../model/Address';
import { Items } from '../model/Item';
import { Order, OrderItem, OrderItems, Orders } from '../model/Order';
import { Users } from '../model/User';

const INVALID_ITEM = 0;
const INSUFFICIENT_BALANCE = 1;
const SUCCESS = 2;

/**
 * Calculate the total price for placing the order and compare it with the user's current balance
 *
 * @param {Object[]} Items      Array of items which requsted for purchase
 * @param {string} token        JWT token
 * 
 * @returns {number} result     Has enough balance or not
 *                                  INVALID_ITEM:           if any of the items has invalid id or item is deleted
 *                                  INSUFFICIENT_BALANCE:   if user does not have enough balance
 *                                  SUCCESS:                if user has enough balance
 * 
 */
const hasEnoughBalance = async (items, token) => {
    return new Promise(async (resolve, reject) => {
        let user = await getCurrentUser(token);
        let totalPrice = 0;
        for (let i = 0; i < items.length; i++) {
            let item = await getItemById(items[i].id);
            console.log(item);
            if (!item) resolve(INVALID_ITEM);
            else totalPrice = totalPrice + (items[i].qty * item.unitPrice);
        }
        if (totalPrice <= user.balance) resolve(SUCCESS);
        else resolve(INSUFFICIENT_BALANCE);
    })
}


/**
 * 
 * Transaction can be handled using session and transaction but that requires database to be hosted with
 * multiple replicaset. So, to support singleHosted database architecture manual transaction handling
 * and rollback operation is defined
 * 
 * Handle the request for placing order into the database
 *
 * @param {Request} request         Request object send by client
 * @param {Response} response       Response object that will be sent to client
 *
 */
const placeOrder = async (req: Request, res: Response) => {

    // Get the current login user
    let user = await getCurrentUser(req.get('x-access-token'));

    // Fetch all the items from the body
    let items = req.body.items;

    /**
     * Check does user has enough balance to purchase the items or not
     */
    let balanceCheck = await hasEnoughBalance(items, req.get('x-access-token'));
    if (balanceCheck === INVALID_ITEM)
        return res.status(400).send(rw(__filename, false, "Item id is invalid or item is deleted"));

    if (balanceCheck === INSUFFICIENT_BALANCE)
        return res.status(403).send(rw(__filename, false, "Insufficient balance"));

    let transactionId = mongoose.Types.ObjectId();
    let reservationList = [];
    let totalQty = 0;
    let totalPrice = 0;

    try {
        for (let i = 0; i < items.length; i++) {

            // Check for the quantity and if available reserve the item
            // To handle the concurrency
            let reserveItem = await Items.findOneAndUpdate(
                { _id: items[i].id, qty: { $gte: items[i].qty } },
                { $inc: { qty: -1 * items[i].qty } });

            if (reserveItem === null) throw new Error("Not enough quantity");

            totalQty += items[i].qty;
            totalPrice += items[i].qty * reserveItem.unitPrice;

            // Register single item into database
            let orderItem = new OrderItem({
                orderId: transactionId, itemId: reserveItem._id, qty: items[i].qty, basePrice: reserveItem.unitPrice,
                storeId: reserveItem.storeId, createdBy: user._id, updatedBy: user._id
            });
            let registerSingleItem = await OrderItems.create(orderItem);
            reservationList.push(registerSingleItem._id);
        }

        // Check user account again for deducting the balance
        let deductingBalance = await Users.findOneAndUpdate(
            { _id: user._id, balance: { $gte: totalPrice } },
            { $inc: { balance: -1 * totalPrice } }
        );

        // If user does not have enough balance throw error
        if (deductingBalance === null) {
            throw new Error("Insufficient balance");
        }

        // If user has provided an different shipping address consider that address
        // if not then use the address from the user object
        let address = req.body.address === undefined ?
            user.address : plainToClass(Address, req.body.address);

        // If all items are reserved successfully, place the final order
        let order = new Order({
            _id: transactionId, items: reservationList, orderBy: user._id,
            totalPrice: totalPrice, totalQty: totalQty, address: address
        });
        let submitOrder = await Orders.create(order);

        // Send the response back to the user
        res.status(201).send(rw(__filename, true, "Order placed ", { id: submitOrder._id }));
    }
    catch (error) {
        // If user does not have enough balance of item does not have enough quantity
        // Rollback the reservedItems
        rollback(reservationList, error, res);
    }
}

/**
 * Rollback the transaction by releasing the reserved items
 * 
 * @param {Object[]} reservationList    Items that are reserved before error
 * @param {error} error                 Error object
 * @param {Response} response           Response object that will be sent to client
 *
 */
const rollback = async (reservationList, error, res) => {
    logging.error("Error in placing order : " + error.message, __filename);
    logging.error("Action : Rollback transaction", __filename);
    for (let i = 0; i < reservationList.length; i++) {
        let remOrder = await OrderItems.findById(reservationList[i]);
        await Items.findOneAndUpdate(
            { _id: remOrder.itemId },
            { $inc: { qty: remOrder.qty } }
        );
        await OrderItems.findByIdAndDelete(reservationList[i]);
    }
    res.status(400).send(rw(__filename, false, error.message));
}

/**
 * Cancel order for given items, add stock back into inventory and refund the balance
 *
 * @param {Object[]} orderItems         List of items from a particular order that needs to be canceled
 * @param {User} user                   User who placed the order
 * @param {Response} response           Response object that will be sent to client
 * @param {ObjectId} orderId            Ref to the order which needs to be canceled
 *
 */
const returnOrder = async (items, user, res, orderId) => {
    logging.error("Canceling order and adding item back to store : ", __filename);
    let totalPrice = 0;
    for (let i = 0; i < items.length; i++) {
        let remOrder = await OrderItems.findById(items[i]);
        await Items.findOneAndUpdate(
            { _id: remOrder.itemId },
            { $inc: { qty: remOrder.qty } }
        );
        totalPrice = totalPrice + (remOrder.basePrice * remOrder.qty);
        await OrderItems.findByIdAndUpdate(items[i], { $set: { status: "Canceled" } });
    }
    await Users.findByIdAndUpdate(user._id, { $inc: { balance: totalPrice } });
    res.status(200).send(rw(__filename, true, "Order cancelled and " + totalPrice + " added back into account", { id: orderId }));
}

/**
 * Handle the request to Cancel order for a particular orderId
 * Check the authorization of the user and if authorized fetch list of items that user has purchased
 * pass that list to returnOrder function
 *
 * @param {Request} request             Request object that will be sent by client
 * @param {Response} response           Response object that will be sent to client
 *
 */

const deleteOrder = async (req: Request, res: Response) => {
    let orderId = req.params.id;
    let currentUser = await getCurrentUser(req.get('x-access-token'));
    try {
        let order = await Orders.findById(orderId);
        if (order === null)
            return res.status(400).send(rw(__filename, false, "No order exist with given order id"));

        if (new String(order.orderBy).valueOf() != new String(currentUser._id).valueOf())
            return res.status(403).send(rw(__filename, false, "You are not authorized to delete this order"));
        let orders = await OrderItems.find({ orderId: orderId, status: 'Placed' });
        if (orders.length === 0)
            return res.status(403).send(rw(__filename, false, "Your order is already shipped or cancelled"));
        let returnItems = [];
        for (let i = 0; i < orders.length; i++) {
            returnItems.push(orders[i]._id);
        }
        returnOrder(returnItems, currentUser, res, orderId);
    }
    catch (error) {
        return res.status(400).send(rw(__filename, false, "Invalid order id"));
    }
}

/**
 * Handle the request to Cancel all order for a particular item
 * Check the authorization of the user and if authorized cancel all order for that
 * id and refund the balance to the user
 *
 * @param {Request} request             Request object that will be sent by client
 * @param {Response} response           Response object that will be sent to client
 *
 */
const deleteOrderForItem = async (req: Request, res: Response) => {
    let itemId = req.params.id;
    let item = await getItemById(itemId);
    if (!item)
        return res.status(400).send(rw(__filename, false, "No item found using this id"));
    let store = await getStoreById(item.storeId);
    let currentUser = await getCurrentUser(req.get('x-access-token'));
    console.log(store);
    console.log(currentUser);
    if (new String(store.ownerId).valueOf() != new String(currentUser._id).valueOf())
        return res.status(403).send(rw(__filename, false, "Only store owner can delete order for an item"));
    let pendingOrder = await OrderItems.find({ itemId: itemId, status: 'Placed' });
    for (let i = 0; i < pendingOrder.length; i++) {
        let qty = pendingOrder[i].qty;
        let price = pendingOrder[i].basePrice;
        let orderDetails = await Orders.findById(pendingOrder[i].orderId);
        let user = await getUserById(orderDetails.orderBy);
        await Items.findOneAndUpdate(
            { _id: itemId },
            { $inc: { qty: qty } }
        );

        await Users.findByIdAndUpdate(user._id, { $inc: { balance: (qty * price) } });
        await OrderItems.findByIdAndUpdate(pendingOrder[i]._id, { $set: { status: 'Canceled' } });
    }
    res.status(200).send(rw(__filename, true, pendingOrder.length + " orders are cancelled for id", { id: itemId }));
}

export { placeOrder, deleteOrder, deleteOrderForItem };

