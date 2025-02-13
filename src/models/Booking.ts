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
  import { User } from './User';
  import { Turf } from './Turf';

  @Table({
    freezeTableName: true,
    tableName: 'Bookings',
  })

export class Booking extends Model<InferAttributes<Booking>, InferCreationAttributes<Booking>> {
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare start_time: Date;

    @Attribute(DataTypes.DATE)
    @NotNull
    declare end_time: Date;

    @Attribute(DataTypes.DECIMAL(10, 2))
    @NotNull
    declare total_cost: number;

    @Attribute(DataTypes.ENUM('confirmed', 'pending', 'canceled', 'maintenance'))
    declare booking_status: string;

    @Attribute(DataTypes.ENUM('online', 'offline'))
    declare payment_type: string;

    @Attribute(DataTypes.ENUM('paid', 'refunded'))
    declare payment_status: string | null;

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    declare userId: number | null;

    @BelongsTo(() => User, {
        foreignKey: 'userId',
        targetKey: 'id'
    })

    declare User: NonAttribute<User>

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    declare turfId: number;

    @BelongsTo(() => Turf, {
        foreignKey: 'turfId',
        targetKey: 'id'
    })

    declare Turf: NonAttribute<Turf>

}