import dotenv from 'dotenv';

dotenv.config();

const MONGO_OPTIONS = {
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: false,
    useNewUrlParser: true,
    socketTimeoutMS: 30000,
    keepAlive: true,
    poolSize: 50,
    autoIndex: true
};

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_USERNAME || '';
const MONGO_HOST = process.env.MONGO_URL || '';
const MONGO_TEST_HOST = process.env.MONGO_TEST_URL || '';

const MONGO = {
    host: MONGO_HOST,
    password: MONGO_PASSWORD,
    username: MONGO_USERNAME,
    options: MONGO_OPTIONS,
    url: `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}`,
};

const testConfig = {
    host: MONGO_TEST_HOST,
    password: MONGO_PASSWORD,
    username: MONGO_USERNAME,
    options: MONGO_OPTIONS,
    url: `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_TEST_HOST}?useUnifiedTopology=false`
}

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT || 3000;

const SERVER = {
    hostname: SERVER_HOSTNAME,
    port: SERVER_PORT,
    testPort: 3001
};

const defaultValidation = {
    validationError: {
        target: false,
        value: false
    }
}

const passwordPattern = /^(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}$/;

const hideStoreAdmin = {
    ownerId: 0, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0
}

const header = [
    { id: 'orderId', title: 'Order ID' },
    { id: 'itemId', title: 'Item ID' },
    { id: 'qty', title: 'Quantity' },
    { id: 'add1', title: 'Address Line 1' },
    { id: 'add2', title: 'Line 2' },
    { id: 'city', title: 'City' },
    { id: 'province', title: 'Province/State' },
    { id: 'postal', title: 'Postal/ZIP' },
    { id: 'country', title: 'Country' }
]


const config = {
    mongo: MONGO,
    test: testConfig,
    server: SERVER,
    secret: 'secretCode',
    passwordRegex: passwordPattern,
    defaultValidation: defaultValidation,
    pageLimit: 10,
    hideStoreAdmin: hideStoreAdmin,
    csvHeader: header
};

export default config;