import { Address } from "../../model/Address";

const validAddress = new Address({
    addressLine1: "1 Abc Street",
    addressLine2: "line2",
    city: "Kitchener",
    province: "Ontario",
    country: "Canada",
    postalCode: "N2E 3R2"
});

const inValidAddress_NoCountry = new Address({
    addressLine1: "1 Abc Street",
    addressLine2: "line2",
    city: "Kitchener",
    province: "Ontario",
    postalCode: "N2E 3R2"
});

export { validAddress, inValidAddress_NoCountry }