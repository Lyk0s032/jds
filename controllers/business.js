const express = require('express');

const { business, person } = require('../db');


module.exports = {
    // Todos los negocios
    async getBusiness(req, res){ 
        res.send('Funciona asas');
    },
    // Obtener negocio especifico
    async getBusinessById(req, res){
        try{
            const { code } = req.params;

            if(!code) return res.send('No reconocemos este enlace');

            const buss = await business.findByPk(code, {
                include: [{
                    model: person,
                    as: "trabajadores"
                }]
            })
            if(!buss) return res.status(404).json({msg: 'No existe'});
            res.json(buss); 
        }catch(err){ 
            res.json(err);
        }

    },

    // POST
    // CREAR NEGOCIO
    async createBusiness(req, res){
        try{
            const { code, name, profileLogo, description, direccion, type, fecha, time} = req.body;
            if(!code || !name || !profileLogo || !description || !direccion || !type) return res.json({err: 'No puede dejar los campos vacios.'});
            const codeValid = await business.findAll({ 
                where: { LegalNumber: code }
            });
            if(codeValid.length) return res.json({msg: 'Ya existe un negocio con este regístro.'});

            const createBusiness = await business.create({ 
                LegalNumber: code,
                name,
                profileLogo,
                description,
                direccion,
                type,
                fecha,
                time
            });
            res.json(createBusiness);

        }catch(err){ 
            console.log(err);
        }
    },


    async updateBusiness(req, res){
        try{
            const { profileLogo, description, direccion, time, businessId} = req.body;
            if(!profileLogo || !description || !direccion || !time || !businessId) return res.status(501).json({msg: 'No pudes dejar campos vacios'})
            const updateBusiness = await business.update({
                profileLogo,
                description,
                time,
                direccion,
            }, {
                where: {
                    id: businessId
                }
            })
            .catch(err => res.status(500).json(err));
            
            res.status(200).json(updateBusiness);

        }catch(err){
            console.log(err);
            res.status(500).json(err);
        }
    }
} 