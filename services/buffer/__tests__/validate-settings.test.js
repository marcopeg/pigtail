import { validateSettings } from '../lib/validate-settings'

describe('validateSettings()', () => {
    test('should accept an happy case', () => {
        const settings = {
            target: 'http://localhost:1234/xxx',
            hostName: 'xxx',
            processName: 'yyy',
            maxChunkSize: 1000,
            maxInterval: 1000,
        }

        expect(validateSettings(settings)).toEqual(settings)
    })

    test('it should complain of a missing target', () => {
        expect(() => validateSettings()).toThrow(/missing "target" setting/)
    })

    test('it should default the "hostName"', () => {
        const { hostName } = validateSettings({ target: 'foo' })
        expect(hostName).toBe('default-host')
    })
    
    test('it should default the "processName"', () => {
        const { processName } = validateSettings({ target: 'foo' })
        expect(processName).toBe('default-proc')
    })
    
    test('it should default the "maxChunkSize"', () => {
        const { maxChunkSize } = validateSettings({ target: 'foo' })
        expect(maxChunkSize).toBe(64000)
    })
    
    test('it should default the "maxInterval"', () => {
        const { maxInterval } = validateSettings({ target: 'foo' })
        expect(maxInterval).toBe(10000)
    })
})
