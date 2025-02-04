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
import { SuperAdmin } from './SuperAdmin';
import { ActionToken } from './ActionToken';
import { Location } from './Location';

  @Table({
    freezeTableName: true,
    tableName: 'Admins',
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password'] }
        }
    }
  })
  export class Admin extends Model<InferAttributes<Admin>, InferCreationAttributes<Admin>> {
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

    @HasMany(() => Location, {
      foreignKey: {
        name: 'adminId',
        onDelete: 'CASCADE'
      },
      sourceKey: 'id'
    })

    declare Locations: NonAttribute<Location>

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @NotNull
    declare superAdminId: number

    @BelongsTo(() => SuperAdmin, {
        foreignKey: 'superAdminId',
        targetKey: 'id',
    })

  //   @HasMany(() => ActionToken, {
  //     foreignKey: {
  //         name: 'adminId',
  //         onDelete: 'CASCADE'
  //     },
  //     sourceKey: 'id'
  // })
    declare SuperAdmin: NonAttribute<SuperAdmin>
  }
  
  
  