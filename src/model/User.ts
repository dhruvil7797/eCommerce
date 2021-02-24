import { getModelForClass, prop } from '@typegoose/typegoose';
import { Type } from 'class-transformer';
import { Allow, IsEmail, Length, Matches, Min, ValidateNested } from 'class-validator';
import config from '../config/config';
import { Address } from './Address';

/**
 * Creates a new user which has a personal details and an object of Address
 * 
 * @class User
 * @mixes Address
 * 
 * @property {string} name      name of the user, must be alphanumeric and alteast contain one character
 * @property {Address} address  object of address class which stores the address of the user
 * @property {number} balance   account balance of the user, {default = 0}
 * @property {string} email     stores the email address of the user
 * @property {string} password  stores the password of the user
 * @property {boolean} isActive works as flag to identify whether user is deleted or not, {default=true}
 * 
 * User model can be access using the Users keyword
 */

export class User {

    public constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }

    @Length(2, 50)
    @Matches(/^[a-zA-Z0-9 ]+$/i)
    @Matches(/^.*[a-zA-Z].*$/i)
    @prop({ required: true, text: true })
    public name!: string;

    @ValidateNested()
    @Type(() => Address)
    @prop({ required: true, _id: false })
    public address!: Address;

    @Min(0)
    @prop({ required: true, default: 0 })
    public balance!: number;

    @IsEmail()
    @prop({ required: true, unique: true, index: true })
    public email!: string;

    @Matches(config.passwordRegex)
    @prop({ required: true })
    public password!: string;

    @Allow()
    @prop({ required: true, default: true })
    public isActive!: boolean;
}

export const Users = getModelForClass(User, {
    schemaOptions: { collection: "users", autoIndex: true, timestamps: true }
});