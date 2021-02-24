import { Items } from "../../model/Item";
import { OrderItems, Orders } from "../../model/Order";
import { Stores } from "../../model/Store";
import { Users } from "../../model/User";

let clearUsers = async () => {
    await Users.deleteMany({});
}

let clearItems = async () => {
    await Items.deleteMany({});
}

let clearStores = async () => {
    await Stores.deleteMany({});
}

let clearOrderItems = async () => {
    await OrderItems.deleteMany({});
}

let clearOrders = async () => {
    await Orders.deleteMany({});
}

let clearAll = async () => {
    await clearOrderItems();
    await clearOrders();
    await clearItems()
    await clearStores();
    await clearUsers();
}

export { clearUsers, clearStores, clearOrders, clearOrderItems, clearItems, clearAll }