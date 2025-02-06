import {
    Sequelize,
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute,
} from '@sequelize/core';
import { attribute } from '@sequelize/core/_non-semver-use-at-your-own-risk_/expression-builders/attribute.js';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Table, Unique, HasMany, BelongsTo } from '@sequelize/core/decorators-legacy';
import { Turf } from './Turf';

@Table({
    freezeTableName: true,
    tableName: "TemporaryReservations"
})

export class TemporaryReservation extends Model<InferAttributes<TemporaryReservation>, InferCreationAttributes<TemporaryReservation>> {
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    declare turfId: number;

    @BelongsTo(() => Turf, {
        foreignKey: 'turfId',
        targetKey: 'id'
    })

    declare Turf: NonAttribute<Turf>

    @Attribute(DataTypes.DATE)
    declare start_time: Date;

    @Attribute(DataTypes.DATE)
    declare end_time: Date;

    @Attribute(DataTypes.DATE)
    declare expiresAt: Date;
}