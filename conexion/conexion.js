import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { createUsuarioModel } from '../modelos/usuariosModelo.js';
// Importa otros modelos según sea necesario

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        }
    }
});

let usuariosModelo = null;
// Declara otras variables de modelo según sea necesario

const connection = async () => {    
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        // Crear modelos
        usuariosModelo = await createUsuarioModel(sequelize);
        
        // Crear otros modelos y relaciones aquí
        // Ejemplo:
        // clientesModelo = await createClienteModel(sequelize);
        // productosModelo = await createProductoModel(sequelize, usuariosModelo);
        
        // Configurar relaciones
        // Ejemplo:
        // usuariosModelo.hasMany(productosModelo, { foreignKey: 'usuarioId' });
        // productosModelo.belongsTo(usuariosModelo, { foreignKey: 'usuarioId' });

        await sequelize.sync();
        console.log("Database Synced");
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export {
    connection,
    usuariosModelo,
    // Exporta otros modelos según sea necesario
    sequelize
};