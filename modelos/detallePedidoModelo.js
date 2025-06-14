import { DataTypes } from 'sequelize';

export const createDetallePedidoModel = (sequelize) => {
    const DetallePedido = sequelize.define('detalles_pedido', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
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
        },
        instrucciones_especiales: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        timestamps: false,
        tableName: 'detalles_pedido'
    });

    return DetallePedido;
};