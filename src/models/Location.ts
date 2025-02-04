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
import { Manager } from './Manager';
import { Turf } from './Turf';
import { Admin } from './Admin';

@Table({
    freezeTableName: true,
    tableName: 'Locations',    
})

export class Location extends Model<InferAttributes<Location>, InferCreationAttributes<Location>> {
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare name: string

    @Attribute(DataTypes.JSON)
    @NotNull
    declare coordinates: object

    @Attribute(DataTypes.JSON)
    @NotNull
    declare amenities: object 

    @Attribute(DataTypes.STRING)
    declare city: string

    @Attribute(DataTypes.STRING)
    declare description: string

    @Attribute(DataTypes.JSON)
    declare images: object

    @Attribute(DataTypes.TIME)
    declare openingTime: string

    @Attribute(DataTypes.TIME)
    declare closingTime: string

    @Attribute(DataTypes.ENUM('active', 'inactive'))
    declare status: string

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    declare adminId: number

    @BelongsTo(() => Admin, {
        foreignKey: 'adminId',
        targetKey: 'id'
    })

    declare Admin: NonAttribute<Admin>

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    declare managerId: number | null

    @BelongsTo(() => Manager, {
        foreignKey: 'managerId',
        targetKey: 'id'
    })

    declare Manager: NonAttribute<Manager>

    @HasMany(() => Turf, {
        foreignKey: {
            name: 'locationId',
            onDelete: 'CASCADE'
        },
        sourceKey: 'id'
    })

    declare Turfs: NonAttribute<Turf[]>

}

