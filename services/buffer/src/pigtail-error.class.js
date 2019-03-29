
export class PigtailError extends Error {
    constructor (message) {
        super(`[PigtailClient] ${message}`)
    }
}
