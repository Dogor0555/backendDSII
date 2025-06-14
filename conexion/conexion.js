import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { createIngredienteModel } from '../modelos/ingredienteModelo.js';
import { createCategoriaProductoModel } from '../modelos/categoriaProductoModelo.js';
import { createProductoModel } from '../modelos/productoModelo.js';
import { createRecetaModel } from '../modelos/recetaModelo.js';
import { createEstadoPedidoModel } from '../modelos/estadoPedidoModelo.js';
import { createPedidoModel } from '../modelos/pedidoModelo.js';
import { createDetallePedidoModel } from '../modelos/detallePedidoModelo.js';
import { createFacturaModel } from '../modelos/facturaModelo.js';
import { createDetalleFacturaModel } from '../modelos/detalleFacturaModelo.js';

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

let ingredientesModelo = null;
let categoriasProductoModelo = null;
let productosModelo = null;
let recetasModelo = null;
let estadosPedidoModelo = null;
let pedidosModelo = null;
let detallesPedidoModelo = null;
let facturasModelo = null;
let detallesFacturaModelo = null;

const connection = async () => {    
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        // Crear modelos
        ingredientesModelo = await createIngredienteModel(sequelize);
        categoriasProductoModelo = await createCategoriaProductoModel(sequelize);
        productosModelo = await createProductoModel(sequelize);
        recetasModelo = await createRecetaModel(sequelize);
        estadosPedidoModelo = await createEstadoPedidoModel(sequelize);
        pedidosModelo = await createPedidoModel(sequelize);
        detallesPedidoModelo = await createDetallePedidoModel(sequelize);
        facturasModelo = await createFacturaModel(sequelize);
        detallesFacturaModelo = await createDetalleFacturaModel(sequelize);

        // Configurar relaciones
        // Relación entre Productos y Categorías
        productosModelo.belongsTo(categoriasProductoModelo, { 
            foreignKey: 'categoria_id',
            as: 'categoria'
        });
        categoriasProductoModelo.hasMany(productosModelo, { 
            foreignKey: 'categoria_id'
        });

        // Relación entre Productos e Ingredientes (Recetas)
        productosModelo.belongsToMany(ingredientesModelo, {
            through: recetasModelo,
            foreignKey: 'producto_id',
            as: 'ingredientes'
        });
        ingredientesModelo.belongsToMany(productosModelo, {
            through: recetasModelo,
            foreignKey: 'ingrediente_id',
            as: 'productos'
        });

        // Relación entre Pedidos y Estados
        pedidosModelo.belongsTo(estadosPedidoModelo, {
            foreignKey: 'estado_id',
            as: 'estado'
        });
        estadosPedidoModelo.hasMany(pedidosModelo, {
            foreignKey: 'estado_id'
        });

        // Relación entre Pedidos y Clientes
        pedidosModelo.belongsTo(clientesModelo, {
            foreignKey: 'cliente_id',
            as: 'cliente'
        });
        clientesModelo.hasMany(pedidosModelo, {
            foreignKey: 'cliente_id'
        });

        // Relación entre Pedidos y Usuarios
        pedidosModelo.belongsTo(usuariosModelo, {
            foreignKey: 'usuario_id',
            as: 'usuario'
        });
        usuariosModelo.hasMany(pedidosModelo, {
            foreignKey: 'usuario_id'
        });

        // Relación entre Pedidos y DetallesPedido
        pedidosModelo.hasMany(detallesPedidoModelo, {
            foreignKey: 'pedido_id',
            as: 'detalles'
        });
        detallesPedidoModelo.belongsTo(pedidosModelo, {
            foreignKey: 'pedido_id'
        });

        // Relación entre DetallesPedido y Productos
        detallesPedidoModelo.belongsTo(productosModelo, {
            foreignKey: 'producto_id',
            as: 'producto'
        });
        productosModelo.hasMany(detallesPedidoModelo, {
            foreignKey: 'producto_id'
        });

        // Relación entre Facturas y Pedidos
        facturasModelo.belongsTo(pedidosModelo, {
            foreignKey: 'pedido_id',
            as: 'pedido'
        });
        pedidosModelo.hasOne(facturasModelo, {
            foreignKey: 'pedido_id'
        });

        // Relación entre Facturas y DetallesFactura
        facturasModelo.hasMany(detallesFacturaModelo, {
            foreignKey: 'factura_id',
            as: 'detalles'
        });
        detallesFacturaModelo.belongsTo(facturasModelo, {
            foreignKey: 'factura_id'
        });

        await sequelize.sync({ alter: true });
        console.log("Database Synced");
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
}

export {
    connection,
    ingredientesModelo,
    categoriasProductoModelo,
    productosModelo,
    recetasModelo,
    estadosPedidoModelo,
    pedidosModelo,
    detallesPedidoModelo,
    facturasModelo,
    detallesFacturaModelo,
    sequelize
};