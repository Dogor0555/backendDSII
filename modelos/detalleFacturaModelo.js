import { DataTypes } from 'sequelize';

export const createDetalleFacturaModel = (sequelize) => {
    const DetalleFactura = sequelize.define('detalles_factura', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        precio_unitario: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        timestamps: false,
        tableName: 'detalles_factura'
    });

    return DetalleFactura;
};