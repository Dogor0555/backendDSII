import { DataTypes } from 'sequelize';

export const createProductoModel = (sequelize) => {
    const Producto = sequelize.define('productos', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        nombre: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        costo_estimado: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        imagen_url: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        es_personalizable: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        fecha_actualizacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false,
        tableName: 'productos'
    });

    return Producto;
};