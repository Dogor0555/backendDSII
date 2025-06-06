import { DataTypes } from "sequelize";

export const createUsuarioModel = async (sequelize) => {
  const usuarios = sequelize.define(
    "usuarios",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      nit: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      nrc: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      giro: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      correo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      telefono: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      complemento: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contrasena: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      logo: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
      codactividad: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      desactividad: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nombrecomercial: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tipoestablecimiento: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      codestablemh: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      codestable: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      codpuntovenmh: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      codpuntoventa: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      departamento: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      municipio: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      passwordfirma: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
    },
    {
      timestamps: false,
    }
  );

  return usuarios;
};