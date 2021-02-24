import path from 'path'

const info = (message: string, fileName: string) => {
    console.log(`[INFO] [${getTimeStamp()}] [${path.relative(process.cwd(), fileName)}] ${message}`);
};

const warn = (message: string, fileName: string) => {
    console.log(`[WARN] [${getTimeStamp()}] [${path.relative(process.cwd(), fileName)}] ${message}`);
};

const error = (message: string, fileName: string) => {
    console.log(`[ERROR] [${getTimeStamp()}] [${path.relative(process.cwd(), fileName)}] ${message}`);
};

const getTimeStamp = (): string => {
    return new Date().toLocaleString();
};

export default {
    info,
    warn,
    error
};