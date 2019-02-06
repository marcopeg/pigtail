import Sequelize from 'sequelize'
import { logError } from 'ssr/services/logger'

export const name = 'Container'

const fields = {
    host: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    cid: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
    },
    meta: {
        type: Sequelize.JSONB,
        allowNull: false,
    },
}

const options = {
    tableName: 'containers',
    freezeTableName: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
}

const bulkUpsert = (conn, Model) => records =>
    Promise.all(records.map(async record => {
        try {
            await Model.create(record)
        } catch (err) {
            try {
                Model.update(record, {
                    where: {
                        host: record.host,
                        cid: record.cid,
                    },
                })
            } catch (err) {
                logError(err)
            }
        }
    }))

export const init = (conn) => {
    const Model = conn.define(name, fields, options)
    Model.bulkUpsert = bulkUpsert(conn, Model)
    return Model.sync()
}

export const reset = async (conn, Model) => {
    await conn.handler.query(`TRUNCATE ${options.tableName} RESTART IDENTITY CASCADE;`)
}
