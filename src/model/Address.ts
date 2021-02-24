import { prop } from '@typegoose/typegoose';
import { Allow, IsOptional, IsPostalCode, Length } from 'class-validator';

/**
 * Creates a new Address
 *
 * @class Address
 *
 * @property {string} addressLine1  addressLine 1 for the address
 * @property {Address} address  object of address class which stores the address of the user
 * @property {number} balance   account balance of the user
 * @property {string} email     stores the email address of the user
 * @property {string} password  stores the password of the user
 * @property {boolean} isActive works as flag to identify whether user is deleted or not
 *
 */

export class Address {

    public constructor(init?: Partial<Address>) {
        Object.assign(this, init);
    }

    @Length(5, 100)
    @prop({ required: true })
    public addressLine1!: string;

    @Allow()
    @IsOptional()
    public addressLine2?: string;

    @Length(2, 50)
    @prop({ required: true })
    public city!: string;

    @Length(2, 50)
    @prop({ required: true })
    public province!: string;

    @Length(2, 50)
    @prop({ required: true })
    public country!: string;

    @IsPostalCode("CA")
    @prop({ required: true })
    public postalCode!: string;

}