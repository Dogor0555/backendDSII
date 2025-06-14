import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { createUsuarioModel } from '../modelos/usuariosModelo.js';
import { createClienteModel } from '../modelos/clienteModelo.js';
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
let clientesModelo = null;
// Declara otras variables de modelo según sea necesario

const connection = async () => {    
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        // Crear modelos
        usuariosModelo = await createUsuarioModel(sequelize);
        clientesModelo = await createClienteModel(sequelize);
        
        // Configurar relaciones si es necesario
        // Ejemplo:
        // usuariosModelo.hasMany(clientesModelo, { foreignKey: 'usuarioId' });
        // clientesModelo.belongsTo(usuariosModelo, { foreignKey: 'usuarioId' });

        await sequelize.sync({ alter: true }); // Usar { force: true } solo en desarrollo para recrear tablas
        console.log("Database Synced");
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error; // Propaga el error para manejo superior
    }
}

export {
    connection,
    usuariosModelo,
    clientesModelo,
    sequelize
};