import {
    Sequelize,
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute,
  } from '@sequelize/core';

import {
    Attribute,
    PrimaryKey,
    AutoIncrement,
    NotNull,
    Table,
    BelongsTo,
 } from '@sequelize/core/decorators-legacy';
 import { SuperAdmin } from './SuperAdmin';
 import { Admin } from './Admin'

@Table({
    freezeTableName: true,
    tableName: 'Logs',
})
export class Log extends Model<InferAttributes<Log>, InferCreationAttributes<Log>> {
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.ENUM('SuperAdmin', 'Admin', 'Manager'))
    @NotNull
    declare role: string;

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @NotNull
    declare userId: number;

    @Attribute(DataTypes.ENUM('creation', 'deactivation', 'update','location-addition', 'location-deletion', 'assigned', 'deassigned', 'other' ))
    @NotNull
    declare actionType: string;

    @Attribute(DataTypes.TEXT)
    declare description: string;

    @BelongsTo(() => SuperAdmin, {
        foreignKey: 'userId',
        targetKey: 'id',
        foreignKeyConstraints: false,
    })
    declare SuperAdmin: NonAttribute<SuperAdmin>

    @BelongsTo(() => Admin, {
        foreignKey: 'userId',
        targetKey: 'id',
        foreignKeyConstraints: false,
    })
    declare Admin: NonAttribute<Admin>
}

