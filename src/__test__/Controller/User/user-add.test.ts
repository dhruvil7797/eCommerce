import { mongoose } from "@typegoose/typegoose";
import { classToPlain } from "class-transformer";
import app from "../../..";
import config from "../../../config/config";
import { Users } from "../../../model/User";
import { validUser, inValidUser_inValidAddress } from "../../Data/user";
import request from 'supertest'
import { clearAll, clearUsers } from "../../Data/databaseCleanup";

mongoose.connect(config.test.url, config.test.options);

describe("User Router Test", () => {
    let server;
    let consoleLog;

    beforeAll(async () => {
        server = app.listen(config.server.testPort);

        // To disable the log during function executing
        consoleLog = console.log;
        console.log = jest.fn();

        // Cleaning up database before all tests
        await clearAll();
    })

    afterAll(done => {
        mongoose.connection.close();
        server.close(done);

        // Enable the log to display the result of the testcase
        console.log = consoleLog;
    })

    // Cleaning up collections to eliminate false possitive
    afterEach(async function () {
        await clearUsers();
    })

    describe("Testing POST /api/v1/Users by creating new Users", () => {
        it("Has valid values expect user to be created", async () => {
            await request(server)
                .post("/api/v1/Users")
                .send(classToPlain(validUser))
                .expect(201);
            const foundUser = await Users.findOne({ name: validUser.name, email: validUser.email });
            expect(foundUser.name).toBe(validUser.name);
            expect(foundUser.email).toBe(validUser.email);
        });

        it("Has invalid values expect user will not be created", async () => {
            await request(server)
                .post("/api/v1/Users")
                .send(classToPlain(inValidUser_inValidAddress))
                .expect(400)
            const foundUser = await Users.findOne({ name: validUser.name, email: validUser.email });
            expect(foundUser).toBe(null);
        });
    });
})