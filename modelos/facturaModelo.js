import { DataTypes } from 'sequelize';

export const createFacturaModel = (sequelize) => {
    const Factura = sequelize.define('facturas', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        numero_factura: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        fecha_emision: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        fecha_vencimiento: {
            type: DataTypes.DATE,
            allowNull: true
        },
        estado: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        impuestos: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        descuento: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        }
    }, {
        timestamps: false,
        tableName: 'facturas'
    });

    return Factura;
};