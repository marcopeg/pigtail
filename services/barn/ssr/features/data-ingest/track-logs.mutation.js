import { logError } from 'ssr/services/logger'

import {
    GraphQLNonNull,
    GraphQLList,
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLBoolean,
} from 'graphql'

import { GraphQLDateTime } from 'graphql-iso-date'
import GraphQLJSON from 'graphql-type-json'
import { createHook } from '@marcopeg/hooks'

import { getModel } from 'ssr/services/postgres'
import { name as Log } from './models/log.model'
import { TRACK_LOGS_RECORDS, TRACK_LOGS_AFTER_CREATE } from './hooks'

export const trackLogs = () => ({
    description: 'TrackLogsMutation',
    args: {
        data: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLInputObjectType({
                name: 'LogRecord',
                fields: {
                    host: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                    process: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                    message: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                    meta: {
                        type: GraphQLJSON,
                    },
                    ctime: {
                        type: GraphQLDateTime,
                    },
                },
            }))),
        },
    },
    type: GraphQLBoolean,
    resolve: async (params, args) => {
        try {
            const logs = args.data.map(record => ({
                ...record,
                ctime: record.ctime || new Date(),
                meta: record.meta || {},
            }))

            createHook(TRACK_LOGS_RECORDS, { args: { logs } })

            await getModel(Log).bulkCreate(logs)

            createHook(TRACK_LOGS_AFTER_CREATE, { args: { logs } })
            return true
        } catch (err) {
            logError(err)
        }
    },
})
