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
import { name as Event } from './models/event.model'
import { TRACK_EVENTS_RECORDS, TRACK_EVENTS_AFTER_CREATE } from './hooks'

export const trackEvents = () => ({
    description: 'TrackEventsMutation',
    args: {
        data: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLInputObjectType({
                name: 'EventRecord',
                fields: {
                    host: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                    event: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                    payload: {
                        type: new GraphQLNonNull(GraphQLJSON),
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
        const events = args.data.map(record => ({
            ...record,
            ctime: record.ctime || new Date(),
        }))

        createHook(TRACK_EVENTS_RECORDS, { args: { events } })

        await getModel(Event).bulkCreate(events)

        createHook(TRACK_EVENTS_AFTER_CREATE, { args: { events } })
        return true
    },
})
