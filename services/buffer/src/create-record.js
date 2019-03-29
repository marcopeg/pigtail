import { PigtailError } from './pigtail-error.class'


/**
 * LOG
 */

const createLog_ = (data, settings) => {
    if (!data.message) {
        throw new PigtailError('missing "message" property for the log')
    }

    const {
        message,
        host,
        process,
        ctime,
        ...meta
    } = data

    if (ctime && !(ctime instanceof Date)) {
        throw new PigtailError('ctime is not a valid date')
    }

    return {
        message,
        host: host || settings.hostName,
        process: process || settings.processName,
        ctime: ctime || null,
        meta,
    }
}

const createLog = (data, settings) => {
    if (typeof data === 'string') {
        return createLog_({ message: data }, settings)
    }

    if (typeof data !== 'object') {
        throw new PigtailError('an object was expected')
    }

    return createLog_(data, settings)
}


/**
 * EVENT
 */

const createEvent = (data) => {}


/**
 * METRIC
 */

const createMetric = (data) => {}

export const recordType = {
    LOG: 'l',
    EVENT: 'e',
    METRIC: 'm',
}

export const createRecord = (type, data, settings) => {
    switch (type) {
        case recordType.LOG:
            return createLog(data, settings)
        case recordType.EVENT:
            return createEvent(data, settings)
        case recordType.METRIC:
            return createMetric(data, settings)
    }
}
