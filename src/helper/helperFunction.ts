import logging from "../config/logging";

/**
 * Send the response back to the client as well also write the response in the console
 *
 * @param {string} fileName     filename from where the function is called
 * @param {boolean} success     flag to identify weather request is fulfilled or received any error
 * @param {any} [message]       success or error message that will be sent as response
 * @param {any} [data]          data that will be sent as response
 *
 */

const rw = (fileName: string, success: Boolean, message?: any, data?: any): object => {
    if (success) logging.info("Message: " + message, fileName);
    else logging.error(message, fileName);

    return {
        success: success,
        message: message || null,
        data: data || null
    }
}

export { rw };
