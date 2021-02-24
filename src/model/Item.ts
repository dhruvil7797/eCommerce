import { getModelForClass, index, prop, Ref } from '@typegoose/typegoose';
import { Allow, IsBoolean, IsOptional, IsPositive, Length, Matches, Min } from 'class-validator';
import { Store } from './Store';
import { User } from './User';

/**
 * Creates a new Item which has basic details about item and store Id where the Item is available
 *
 * @class Item
 * @requires Store
 *
 * @property {string} naem              Contains name of the item
 * @property {string} [description]     Contains the description of the item
 * @property {number} unitPrice         Current price of item per unit
 * @property {number} qty               Total available quantity of this item
 * @property {Ref<Stroe>} storeId       Reference to the Store where the item is available
 * @property {boolean} isActive         works as flag to identify whether item is deleted or not, {default=true}
 *
 * Order model can be access using the Orders keyword
 * It has a text index on name and description for full-text search
 */

@index({ name: 'text', description: 'text' })
export class Item {

    @Length(2, 100)
    @Matches(/^[a-zA-Z0-9 ]+$/i)
    @Matches(/^.*[a-zA-Z].*$/i)
    @prop({ required: true, text: true })
    public name!: string;

    @IsOptional()
    @Matches(/^[a-zA-Z0-9 ]+$/i)
    @Matches(/^.*[a-zA-Z].*$/i)
    @Length(10, 500)
    @prop()
    public description?: string;

    @IsPositive()
    @prop({ required: true })
    public unitPrice!: number;

    @Min(0)
    @prop({ required: true })
    public qty!: number;

    @Allow()
    @prop({ required: true, ref: () => Store })
    public storeId?: Ref<Store>;

    @IsOptional() // As it contains default value
    @IsBoolean()
    @prop({ required: true, default: true })
    public isActive!: boolean;

    @Allow()
    @prop({ required: true, ref: User })
    public createdBy!: Ref<User>;

    @Allow()
    @prop({ required: true, ref: User })
    public updatedBy!: Ref<User>;
}

export const Items = getModelForClass(Item, {
    schemaOptions: { collection: "items", autoIndex: true, timestamps: true }
});