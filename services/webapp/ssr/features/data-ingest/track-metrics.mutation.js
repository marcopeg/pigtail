import {
    GraphQLNonNull,
    GraphQLList,
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLBoolean,
} from 'graphql'

import { GraphQLDateTime } from 'graphql-iso-date'
import GraphQLJSON from 'graphql-type-json'

import { getModel } from 'ssr/services/postgres'
import { name as Metric } from './metric.model'

export const trackMetrics = () => ({
    description: 'TrackMetricsMutation',
    args: {
        data: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLInputObjectType({
                name: 'MetricRecord',
                fields: {
                    host: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                    metric: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                    value: {
                        type: new GraphQLNonNull(GraphQLJSON),
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
        await getModel(Metric).bulkCreate(args.data.map(record => ({
            ...record,
            ctime: record.ctime || new Date(),
            meta: record.meta || {},
        })))
        return true
    },
})
