import { DataTypes } from 'sequelize';

export const createEstadoPedidoModel = (sequelize) => {
    const EstadoPedido = sequelize.define('estados_pedido', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        es_final: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: false,
        tableName: 'estados_pedido'
    });

    return EstadoPedido;
};