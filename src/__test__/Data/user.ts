import { User } from "../../model/User";
import { inValidAddress_NoCountry, validAddress } from "./address";

let validUser = new User({
    name: "User 1",
    address: validAddress,
    balance: 0,
    email: "dummyEmail@abc.com",
    password: "Abcd@1234",
});

let inValidUser_inValidAddress = new User({
    name: "User 1",
    address: inValidAddress_NoCountry,
    balance: 0,
    email: "dummyEmail@abc.com",
    password: "Abcd@1234",
});

export { validUser, inValidUser_inValidAddress };