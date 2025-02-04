import { Sequelize } from '@sequelize/core';
import { MySqlDialect } from "@sequelize/mysql"

import * as models from '../models';

const sequelize = new Sequelize({
    dialect: MySqlDialect,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '7878954123',
    database: 'turf_management',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,

    models: Object.values(models),
})

export default sequelize;