import { createRecord, recordType } from '../lib/create-record'

describe('createRecord', () => {
    const settings = {
        hostName: 'x',
        processName: 'y',
    }

    describe('Record Type Log', () => {

        test('it should handle a new log from a string', () => {
            const record = createRecord(recordType.LOG, 'foo', settings)

            expect(record.message).toBe('foo')
            expect(record.host).toBe(settings.hostName)
            expect(record.process).toBe(settings.processName)
            expect(record.ctime).toBeNull()
            expect(record.meta).toEqual({})
        })
        
        test('it should handle a new log from an object with meta', () => {
            const ctime = new Date()
            const record = createRecord(recordType.LOG, {
                message: 'foo',
                host: 'custom-host',
                process: 'custom-process',
                ctime,
                foo: 123,
            }, settings)

            expect(record.message).toBe('foo')
            expect(record.host).toBe('custom-host')
            expect(record.process).toBe('custom-process')
            expect(record.ctime).toEqual(ctime)
            expect(record.meta).toEqual({ foo: 123 })
        })

        test('it should fail if the date is not valid', () => {
            expect(() => createRecord(recordType.LOG, {
                message: 'foo',
                ctime: 'foo',
            }, settings)).toThrow(/ctime is not a valid date/)
        })

    })
})
