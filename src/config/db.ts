import { Sequelize } from '@sequelize/core';
import { MySqlDialect } from "@sequelize/mysql"

import * as models from '../models';

const sequelize = new Sequelize({
    dialect: MySqlDialect,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'turf_management',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,

    models: Object.values(models),
})

export default sequelize;