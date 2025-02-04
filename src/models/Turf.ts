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
import { Location } from './Location';

@Table({
    freezeTableName: true,
    tableName: 'Turfs'
})

export class Turf extends Model<InferAttributes<Turf>, InferCreationAttributes<Turf>> {
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare name: string

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare duration: number

    @Attribute(DataTypes.STRING)
    @NotNull
    declare description: string

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare cost_per_slot: number

    @Attribute(DataTypes.STRING)
    @NotNull
    declare ground_type: string

    @Attribute(DataTypes.STRING)
    declare sport_type: string

    @Attribute(DataTypes.JSON)
    declare images: object

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    declare locationId: number

    @Attribute(DataTypes.ENUM('active', 'inactive'))
    declare status: string

    @BelongsTo(() => Location, {
        foreignKey: 'locationId',
        targetKey: 'id'
    })

    declare Location: NonAttribute<Location>

}