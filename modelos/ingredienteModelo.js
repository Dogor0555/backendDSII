import { DataTypes } from 'sequelize';

export const createIngredienteModel = (sequelize) => {
    const Ingrediente = sequelize.define('ingredientes', {
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
        stock: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        unidad_medida: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        costo_por_unidad: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
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
        tableName: 'ingredientes'
    });

    return Ingrediente;
};