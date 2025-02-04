import {
    Sequelize,
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute
} from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Table, Unique, HasMany  } from '@sequelize/core/decorators-legacy';
import { ActionToken } from './ActionToken';
import { Admin } from './Admin';


@Table({
    freezeTableName: true,
    tableName: 'SuperAdmins',
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password'] }
        }
    }
  })

  export class SuperAdmin extends Model<InferAttributes<SuperAdmin>, InferCreationAttributes<SuperAdmin>> {
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

    @HasMany(() => Admin, {
        foreignKey: {
            name: 'superAdminId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        sourceKey: 'id'
    })
    

    declare Admin: NonAttribute<Admin[]>



    @HasMany(() => ActionToken, {
        foreignKey: {
            name: 'superAdminId',
            onDelete: 'CASCADE'
        },
        sourceKey: 'id',
    })

    declare ActionTokens: NonAttribute<ActionToken[]>

  }
 
