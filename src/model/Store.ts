import { prop, getModelForClass, Ref, index } from '@typegoose/typegoose';
import { Address } from './Address'
import { User } from './User'
import { Allow, IsBoolean, IsOptional, Length, Matches, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer';

/**
 * Creates a new Store which has basic store details, Address and ownerID as User
 *
 * @class Store
 * @mixes Address
 * @requires User
 *
 * @property {string} name          name of the store, must be alphanumeric and alteast contain one character
 * @property {Address} address      object of address class which stores the address of the store
 * @property {Ref<User>} ownerId    reference to a user which will be the owner of this store
 * @property {boolean} isActive     works as flag to identify whether store is deleted or not, {default=true}
 *
 * Store model can be access using the Stores keyword
 * It has a text index on name to support full-text search
 */

@index({ 'name': 'text' })
export class Store {

    @Length(2, 50)
    @Matches(/^[a-zA-Z0-9 ]+$/i)
    @Matches(/^.*[a-zA-Z].*$/i)
    @prop({ required: true, text: true })
    public name!: string;

    @ValidateNested()
    @Type(() => Address)
    @prop({ required: true, _id: false })
    public address!: Address;

    @Allow()
    @prop({ required: true, ref: User })
    public ownerId!: Ref<User>;

    @IsOptional()
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

export const Stores = getModelForClass(Store, {
    schemaOptions: { collection: "stores", autoIndex: true, timestamps: true },
});
