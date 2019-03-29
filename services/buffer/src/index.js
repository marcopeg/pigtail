import { validateSettings } from './validate-settings'

export const createPigtailClient = (receivedSettings) => {
    const settings = validateSettings(receivedSettings)
    const data = {
        logs: [],
        metrics: [],
        events: [],
    }

    return {
        log: () => {},
        trackMetric: () => {},
        pushEvent: () => {},
    }
}
