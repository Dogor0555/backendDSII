import { DataTypes } from 'sequelize';

export const createRecetaModel = (sequelize) => {
    const Receta = sequelize.define('recetas', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        cantidad: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        instrucciones: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        timestamps: false,
        tableName: 'recetas'
    });

    return Receta;
};