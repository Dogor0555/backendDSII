import { usuariosModelo } from '../conexion/conexion.js';
import bcrypt from 'bcryptjs';

export const getAllUsu = async (req, res) => {
    try {
        const usuarios = await usuariosModelo.findAll();
        if (usuarios.length === 0) {
            return res.status(200).json({ "error": "No hay usuarios registrados" });
        }
        return res.status(200).json(usuarios);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Error interno al obtener los usuarios" });
    }
}

export const addUsu = async (req, res) => {
    const { nombre, nit, nrc, giro, correo, telefono, complemento, contrasena, logo, 
            codactividad, desactividad, nombrecomercial, tipoestablecimiento, 
            codestablemh, codestable, codpuntovenmh, codpuntoventa, departamento, 
            municipio, passwordfirma } = req.body;
    
    try {
        // Verificar si el usuario ya existe por NIT o correo
        const usuarioExistente = await usuariosModelo.findOne({
            where: {
                [Op.or]: [
                    { nit: nit },
                    { correo: correo }
                ]
            }
        });

        if (usuarioExistente) {
            return res.status(400).json({ message: "El usuario ya existe (NIT o correo duplicado)" });
        }

        // Hash de la contraseña si se proporciona
        let hashedPassword = null;
        if (contrasena) {
            hashedPassword = await bcrypt.hash(contrasena, 10);
        }

        // Crear el nuevo usuario
        await usuariosModelo.create({
            nombre,
            nit,
            nrc,
            giro,
            correo,
            telefono,
            complemento,
            contrasena: hashedPassword,
            logo,
            codactividad,
            desactividad,
            nombrecomercial,
            tipoestablecimiento,
            codestablemh,
            codestable,
            codpuntovenmh,
            codpuntoventa,
            departamento,
            municipio,
            passwordfirma
        });

        return res.status(201).json({ message: "Usuario creado exitosamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Error interno al agregar el usuario" });
    }
}

export const updateUsu = async (req, res) => {
    const { usuId } = req.params;
    const { nombre, nit, nrc, giro, correo, telefono, complemento, contrasena, logo, 
            codactividad, desactividad, nombrecomercial, tipoestablecimiento, 
            codestablemh, codestable, codpuntovenmh, codpuntoventa, departamento, 
            municipio, passwordfirma } = req.body;

    try {
        const usuario = await usuariosModelo.findOne({ where: { id: usuId } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Hash de la nueva contraseña si se proporciona
        let hashedPassword = usuario.contrasena;
        if (contrasena) {
            hashedPassword = await bcrypt.hash(contrasena, 10);
        }

        // Actualizar el usuario
        await usuariosModelo.update({
            nombre,
            nit,
            nrc,
            giro,
            correo,
            telefono,
            complemento,
            contrasena: hashedPassword,
            logo,
            codactividad,
            desactividad,
            nombrecomercial,
            tipoestablecimiento,
            codestablemh,
            codestable,
            codpuntovenmh,
            codpuntoventa,
            departamento,
            municipio,
            passwordfirma
        }, { where: { id: usuId } });

        return res.status(200).json({ message: "Usuario actualizado exitosamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Error interno al actualizar el usuario" });
    }
}

export const deleteUsu = async (req, res) => {
    const { usuId } = req.params;
    try {
        const usuario = await usuariosModelo.findOne({ where: { id: usuId } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        await usuariosModelo.destroy({ where: { id: usuId } });
        return res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Error interno al eliminar el usuario" });
    }
}

export const getUsuarioById = async (req, res) => {
    const { usuId } = req.params;
    try {
        const usuario = await usuariosModelo.findOne({ where: { id: usuId } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        return res.status(200).json(usuario);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Error interno al obtener el usuario" });
    }
}