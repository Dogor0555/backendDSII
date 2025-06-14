// models/cliente.model.js
import { DataTypes } from "sequelize";

export const createClienteModel = (sequelize) => {
  return sequelize.define(
    "clientes",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      dui: {
        type: DataTypes.STRING(10),
        allowNull: true,
        unique: true,
        validate: {
          is: /^\d{8}-\d{1}$/ // Formato DUI: 12345678-9
        }
      },
      direccion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING(15),
        allowNull: true,
        validate: {
          is: /^[0-9+() -]+$/ // Validación básica para teléfonos
        }
      }
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      hooks: {
        beforeValidate: (cliente) => {
          // Limpiar formato del DUI
          if (cliente.dui) {
            cliente.dui = cliente.dui.replace(/\D/g, '').replace(/^(\d{8})(\d{1})$/, '$1-$2');
          }
          // Limpiar formato del teléfono
          if (cliente.telefono) {
            cliente.telefono = cliente.telefono.replace(/\s+/g, '').trim();
          }
        }
      }
    }
  );
};