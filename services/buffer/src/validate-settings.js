import { PigtailError } from './pigtail-error.class'

export const validateSettings = (settings = {}) => {
    if (!settings.target) {
        throw new PigtailError('missing "target" setting')
    }

    const {
        target,
        hostName,
        processName,
        maxChunkSize,
        maxInterval,
    } = settings

    return {
        target,
        hostName: hostName || 'default-host',
        processName: processName || 'default-proc',
        maxChunkSize: maxChunkSize || 64000,
        maxInterval: maxInterval || 10000,
    }
}
