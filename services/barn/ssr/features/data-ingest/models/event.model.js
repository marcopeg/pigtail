import Sequelize from 'sequelize'

export const name = 'Event'

const fields = {
    ctime: {
        type: Sequelize.DATE,
    },
    host: {
        type: Sequelize.STRING,
    },
    event: {
        type: Sequelize.STRING,
    },
    payload: {
        type: Sequelize.JSONB,
        allowNull: false,
    },
}

const options = {
    schema: 'pigtail',
    tableName: 'events',
    freezeTableName: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    hooks: {
        afterSync: ({ sequelize }) =>
            sequelize
                .query(`SELECT create_hypertable('events', 'ctime')`)
                .catch(() => {})
        ,
    },
}

export const init = (conn) => {
    const Model = conn.define(name, fields, options)
    return Model.sync()
}

export const reset = async (conn, Model) => {
    await conn.handler.query(`TRUNCATE ${options.tableName} RESTART IDENTITY CASCADE;`)
}
