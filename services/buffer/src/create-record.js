import { PigtailError } from './pigtail-error.class'


/**
 * LOG
 */

const createLog_ = (data, settings) => {
    const {
        message,
        host,
        process,
        ctime,
        ...meta
    } = data

    if (!message) {
        throw new PigtailError('missing log "message"')
    }

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

const createEvent_ = (event, settings) => {
    const {
        name,
        ctime,
        host,
        process,
        identity,
        ...payload
    } = event

    if (!name) {
        throw new PigtailError('missing event "name"')
    }

    if (ctime && !(ctime instanceof Date)) {
        throw new PigtailError('ctime is not a valid date')
    }

    return {
        name,
        payload,
        identity: identity || null,
        host: host || settings.hostName,
        process: process || settings.processName,
        ctime: ctime || null,
    }
}

const createEvent = (name, payload, settings) => {
    if (typeof name === 'object') {
        return createEvent_(name, payload)
    }
    
    if (typeof name === 'string' && typeof payload === 'object') {
        return createEvent_({ ...payload, name }, settings)
    }

    throw new PigtailError('unexpected event format')
}


/**
 * METRIC
 */

const createMetric = (data) => {}

export const recordType = {
    LOG: 'l',
    EVENT: 'e',
    METRIC: 'm',
}

export const createRecord = (type, ...args) => {
    switch (type) {
        case recordType.LOG:
            return createLog(...args)
        case recordType.EVENT:
            return createEvent(...args)
        case recordType.METRIC:
            return createMetric(...args)
    }
}
