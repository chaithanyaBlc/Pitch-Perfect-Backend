import {
    Sequelize,
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute,
} from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Table, Unique, HasMany, BelongsTo } from '@sequelize/core/decorators-legacy';
import { Admin } from './Admin';
import { Location } from './Location';
import { ActionToken } from './ActionToken';

@Table({
    freezeTableName: true,
    tableName: 'Managers',
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password'] }
        }
    }
})

export class Manager extends Model<InferAttributes<Manager>, InferCreationAttributes<Manager>> {
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare name: string 

    @Attribute(DataTypes.STRING)
    @Unique
    @NotNull
    declare email: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare username: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare password: string;
    
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @NotNull
    declare adminId: number;

    @Attribute(DataTypes.ENUM('active', 'inactive'))
    declare status: string;

    @BelongsTo(() => Admin, {
        foreignKey: 'adminId',
        targetKey: 'id'
    })

    declare Admin: NonAttribute<Admin>

    @HasMany(() => Location, {
        foreignKey: {
            name: 'managerId',
            onDelete: 'CASCADE'
        },
        sourceKey: 'id'
    })

    declare Locations: NonAttribute<Location>

    @HasMany(() => ActionToken, {
        foreignKey: {
            name: 'managerId',
            onDelete: 'CASCADE'
        },
        sourceKey: 'id',
    })

    declare ActionTokens: NonAttribute<ActionToken[]>

    
}

