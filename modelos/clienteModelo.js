import { DataTypes } from 'sequelize';

export const createClienteModel = (sequelize) => {
    const Cliente = sequelize.define('clientes', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dui: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: true
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: true,
        tableName: 'clientes'
    });

    return Cliente;
};