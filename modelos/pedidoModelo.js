import { DataTypes } from 'sequelize';

export const createPedidoModel = (sequelize) => {
    const Pedido = sequelize.define('pedidos', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        fecha_pedido: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        fecha_entrega: {
            type: DataTypes.DATE,
            allowNull: true
        },
        direccion_entrega: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        telefono_contacto: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        notas: {
            type: DataTypes.TEXT,
            allowNull: true
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
        metodo_pago: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
        timestamps: false,
        tableName: 'pedidos'
    });

    return Pedido;
};