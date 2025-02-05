import {
    Sequelize,
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute,
  } from '@sequelize/core';
  import { Attribute, PrimaryKey, AutoIncrement, NotNull, Table, Unique, BelongsTo } from '@sequelize/core/decorators-legacy';
import { SuperAdmin } from './SuperAdmin';
import { Admin } from './Admin';
import { Manager } from './Manager';

  @Table({
    freezeTableName: true,
    tableName: 'ActionToken',
  })
  export class ActionToken extends Model<InferAttributes<ActionToken>, InferCreationAttributes<ActionToken>> {
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    declare adminId: number | null

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    declare superAdminId: number | null

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    declare managerId: number | null

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    declare userId: number | null

    @Attribute(DataTypes.ENUM('setup', 'resetPassword', 'email-change'))
    @NotNull
    declare purpose: string

    @Attribute(DataTypes.STRING)
    @NotNull
    declare token: string

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare isUsed: boolean

    @Attribute(DataTypes.STRING)
    declare newEmail: string | null

 
    @BelongsTo(() => SuperAdmin, {
        foreignKey: 'superAdminId',
        targetKey: 'id'
    })

    declare SuperAdmin: NonAttribute<SuperAdmin>

    @BelongsTo(() => Admin, {
        foreignKey: 'adminId',
        targetKey: 'id',
    })

    declare Admin: NonAttribute<Admin>

    @BelongsTo(() => Manager, {
      foreignKey: 'managerId',
      targetKey: 'id'
    })

    declare Manager: NonAttribute<Manager>
    


  }
  
  
  