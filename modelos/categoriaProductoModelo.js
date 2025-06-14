import { DataTypes } from 'sequelize';

export const createCategoriaProductoModel = (sequelize) => {
    const CategoriaProducto = sequelize.define('categorias_productos', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        nombre: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        activa: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        timestamps: false,
        tableName: 'categorias_productos'
    });

    return CategoriaProducto;
};