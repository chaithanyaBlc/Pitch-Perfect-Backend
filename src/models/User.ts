import {
    Sequelize,
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute,
  } from '@sequelize/core';
  import { Attribute, PrimaryKey, AutoIncrement, NotNull, Table, Unique, BelongsTo, HasMany } from '@sequelize/core/decorators-legacy';
  import { Booking } from './Booking';
  import { ActionToken } from './ActionToken';

  @Table({
    freezeTableName: true,
    tableName: 'Users',
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password'] }
        }
    }
  })

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare name: string

    @Attribute(DataTypes.STRING)
    @NotNull
    declare username: string;

    @Attribute(DataTypes.STRING)
    @Unique
    @NotNull
    declare email: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare password: string;

    @HasMany(() => Booking, {
        foreignKey: {
            name: 'userId',
            onDelete: 'CASCADE'
        },
        sourceKey: 'id'
    })

    declare Bookings: NonAttribute<Booking>

    @HasMany(() => ActionToken, {
        foreignKey: {
            name: 'userId',
            onDelete: 'CASCADE'
        },
        sourceKey: 'id'
    })
    declare ActionTokens: NonAttribute<ActionToken>
}