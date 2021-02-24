import { prop, getModelForClass, Ref, mongoose } from '@typegoose/typegoose';
import { Store } from './Store'
import { User } from './User'
import { Item } from './Item'
import { Address } from './Address'
import { Allow, IsIn, IsOptional, IsPositive, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Creates a new OrderItem which has details about a single item from a complete order
 * An order may contains multiple OrderItem
 *
 * @class OrderItem
 * @requires Item
 * @requires Store
 *
 * @property {ObjectId} orderId     A string to identify the order it will be same for all items for one Order
 * @property {Ref<Item>} itemId     Reference to the item which is ordered
 * @property {number} qty           Quantity of item ordered
 * @property {number} basePrice     Price of item per unit
 * @property {string} status        Stutus of the order. It can be either "Placed", "Shipped" or "Canceled" 
 * @property {Ref<Store>} storeId   Reference to the store where the item belongs to
 *
 * OrderItem model can be access using the OrderItems keyword
 */

export class OrderItem {

    public constructor(init?: Partial<OrderItem>) {
        Object.assign(this, init);
    }

    @Allow()
    @prop({ required: true })
    public orderId!: mongoose.Types.ObjectId;

    @Allow()
    @prop({ required: true, ref: Item })
    public itemId!: Ref<Item>;

    @IsPositive()
    @prop({ required: true })
    public qty!: number;

    @IsPositive()
    @prop({ required: true })
    public basePrice!: number;

    @Allow()
    @IsOptional()
    @IsIn(['Placed', 'Shipped', 'Canceled'])
    @prop({ required: true, default: "Placed" })
    public status!: string;

    @Allow()
    @prop({ required: true, ref: Store })
    public storeId!: Ref<Store>;

    @Allow()
    @prop({ required: true, ref: User })
    public createdBy!: Ref<User>;

    @Allow()
    @prop({ required: true, ref: User })
    public updatedBy!: Ref<User>;
}

/**
 * Creates a new Order which has details about user, shipping address and items that are ordered
 *
 * @class Order
 * @requires OrderItem
 * @requires User
 *
 * @property {ObjectId} _id             Works as a primary key which will be used in OrderItem table
 * @property {Ref<User>} ordetBy        Reference to the user who placed the order
 * @property {number} totalQty          Total quantity of item ordered
 * @property {number} totalPrice        Total price of the order
 * @property {Address} address          Shipping address that can be same as the user address or can be different
 * @property {Ref<OrderItem>[]} storeId Reference to the OrderItem array which stores the details of individual items
 *
 * Order model can be access using the Orders keyword
 */

export class Order {

    public constructor(init?: Partial<Order>) {
        Object.assign(this, init);
    }

    @Allow()
    @prop({ required: true })
    public _id: mongoose.Types.ObjectId

    @Allow()
    @prop({ required: true, ref: User })
    public orderBy!: Ref<User>;

    @IsPositive()
    @prop({ required: true })
    public totalQty!: number;

    @IsPositive()
    @prop({ required: true })
    public totalPrice!: number;

    @ValidateNested()
    @Type(() => Address)
    @prop({ required: true, _id: false })
    public address!: Address;

    @Allow()
    @prop({ required: true, ref: OrderItem })
    public items!: Ref<OrderItem>[];
}

export const OrderItems = getModelForClass(OrderItem, {
    schemaOptions: { collection: "order_item", timestamps: true, autoIndex: true }
});

export const Orders = getModelForClass(Order, {
    schemaOptions: { collection: "orders", timestamps: true, autoIndex: true, _id: false }
});