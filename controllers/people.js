const express = require('express');

const { business, person, salary, movement } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/Auth');
// Pequeña revisión
module.exports = {
    async getPeople(req, res){ 
        res.send('Funciona asas'); 
    },

    async getPeopleById(req, res){
        try{
            const { numberDocument, businessId } = req.params;
        
            if(!numberDocument || !businessId) return res.status(401).json({msg: 'No hemos detectado un id valido'});
    
            const usuario = await person.findOne({
                where: {
                    numberDocument,
                    businessId
                }
            }).then(async user => {
                if(!user) return res.status(404).json({msg: 'No hemos encontrado este usuario'});
                const showUser = await person.findByPk(user.id,{
                    include:[{
                        model: movement,
                        as: 'movimientos'
                    },{
                        model: salary,
                    }]
                });
                res.status(200).json(showUser);
            });
        }catch(err){
            res.status(500).json(err)
        }
        
    },
    async Register(req, res){
        try{
            const { name, numberDocument, email, profileIMG, range, fecha, imgDocument, sexo, businessId } = req.body;
            const passwordy = String(numberDocument);
            let password = bcrypt.hashSync(passwordy, Number.parseInt(authConfig.rounds));
            if(!name || !numberDocument || !email || !range || !fecha || !sexo || !businessId) return res.status(404).json({msg: 'No puede dejar los campos vacios'});
            const create = await person.create({
                name,
                numberDocument,
                email,
                password,
                profileIMG,
                fecha,
                range,
                imgDocument,
                sexo,
                businessId
            }).then(user => { 
                let token = jwt.sign({user:user}, authConfig.secret, {
                    expiresIn: authConfig.expires 
                });

                res.status(200).json({
                    user:user,
                    token:token
                })
            })

        }catch(err){
            console.log(err);
            res.status(500).json(err);
        }

    },
    // INICIAR SESION
    async SingIn(req,res){
        try{
            const { email, password } = req.body;

            // Buscar usuario
            const Usuario = await person.findOne({
                where: {email: email}
            }).then(user => { 
                // Si no existe, envie esto:
                if(!user) return res.status(404).json({msg: "No hemos encontrado usuario con este correo"});

                // Caso contrario
                if(bcrypt.compareSync(password, user.password)){

                    // Devolvemos el token 
                    jwt.sign({user:user}, authConfig.secret, (err, token) => {
                        
                        res.status(200).json({
                            token:token,
                            user:user
                        })
                    })
                }else{
                    // Contraseña incorrecta
                    res.status(401).json({msg: "Contraseña incorrecta"})
                }
            });


            
        }catch(err){
            res.json(err);
        }
    },
    // Obtengo información de un registro persona por ID
    async getPersonById(req, res){
        try{
            const { document } = req.params;

            if(!document) return res.send('No reconocemos este enlace');
            
            const searchProfile = await person.findAll({
                where: { 
                    numberDocument: document
                }
            });
            if(!searchProfile.length) return res.send('No existe este perfil');
            
            const persona = await person.findByPk(searchProfile[0].id, {
                include: [{
                    model: salary
                }],
            });
            res.json(persona);
        }catch(err){
            res.json(err);
        }

    },
    // Obtengo todos los movimientos economicos realizados a un perfil
    async getMovementstoProfile(req, res){
        try{
            // Obtener variable del params
            const { doc } = req.params;
            // Recibir usuario con ese documento
            const user = await person.findAll({
                where: {numberDocument: doc}
            });
            // Validar existencia del usuario
            if(!user.length) return res.json({msg:'No hemos encontrado este usuario'});
            // Traer usuario con esos pagos 
            const profile = await person.findByPk(user[0].id,{
                include: [
                    {
                        model: movement,
                        as: 'movimientos',
                        attributes: ['type', 'description', 'valor']
                    }
                ],
                attributes: ['name', 'numberDocument', 'email', 'profileIMG', 'fecha', 'imgDocument', 'sexo', 'businessId']
            });
            res.json(profile);
        }catch(err){
            console.log(err);
        }
    },  

    // POST
    // Creo un perfil
    async createProfile(req, res){
        try{
            const { name, numberDocument, email, profileIMG, fecha, imgDocument, sexo, businessId } = req.body;
            if(!name || !numberDocument || !email || !profileIMG || !fecha || !imgDocument || !sexo || !businessId) return res.json({err: 'No puede dejar los campos vacios para crear el perfil.'});
            const documentValidate = await person.findAll({ 
                where: { numberDocument }
            });
            if(documentValidate.length) return res.json({msg: 'Ya existe un perfil con este nro de documento.'});

            const createProfile = await person.create({  
                numberDocument,
                name,
                email,
                profileIMG,
                fecha,
                imgDocument,
                sexo, 
                businessId  
            });
            res.json(createProfile);

        }catch(err){ 
            console.log(err);
        }
    }
} 