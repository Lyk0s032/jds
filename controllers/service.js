const express = require('express');

const { business, person, service, PayService, Op} = require('../db');
const { default: axios } = require('axios');


module.exports = {
    // Todos los negocios
    async getServicesOfBusiness(req, res){ 
        try{
            const { businessId } = req.params;

            const searchServices = await service.findAll({
                where:{
                    businessId
                },
                include: [{
                    model: PayService,
                    as: 'pagos'
                }]
            });
            if(!searchServices.length) return res.status(404).json({msg: 'No hemos encontrado registros'})
            res.status(200).json({searchServices});
        }catch(err){
            console.log(err);
            res.status(500).json(err);
        }
    },
    async getServiceById(req, res){
        try{
            const { businessId, servicesId} = req.params;
            if(!businessId || !servicesId) return res.status(501).json({msg: 'No cumple con los requisitos'});
            let currentlyDate = new Date();
            const año = currentlyDate.getFullYear(); // El año
            const month = currentlyDate.getMonth() + 1; // MEs
            const day = currentlyDate.getDate();
            const fechaActual = String(`${año}-${month}-${day}`);
            const fechaNormal = new Date(fechaActual);
        
            console.log(day);

            const findService = await service.findOne({
                where: {
                    id: servicesId,
                    businessId
                },
                include: [{
                    model: PayService,
                    as: 'pagos' 
                }],
                order: [[{model: PayService, as: 'pagos'}, 'fecha', 'DESC']], // Ordenamos en orden descendente.             
            }).catch(err => {
                console.log(err);
                return res.status(500).json(err);
            });
            if(!findService) return res.status(404).json({msg: 'No hemos encontrado esto.'});
            // antes de enviar, valido
            if(!findService.pagos.length){
                return res.status(200).json(findService);
            }else{
                // Defino Fecha último pago
                const lastPay = new Date(findService.pagos[0].fecha);
                // Defino la diferencia entre el último pago y la fecha actual
                let diferencia = fechaNormal.getTime() - lastPay.getTime();
                // Calculo la diferencia de días
                let diasDiferencia = diferencia / 1000 / 60 / 60 / 24;
                console.log(lastPay);
                console.log('división');

                console.log(fechaNormal);


                console.log(diferencia);
                console.log(diasDiferencia); 

                if(diasDiferencia >= 30){
                    if(diasDiferencia - 30 < findService.dayDisponibility){
                        if(findService.active == 'pending'){
                            return res.status(200).json(findService);

                        }else{
                            const updateFindService = await service.update({
                                active: "pending"
                            },
                            {
                                where: {
                                    id: findService.id,
                                }
                            })
                            return res.status(200).json(findService);

                        }
                    }else{
                        const fechaLastRegister = String(`${año}-${month}-${findService.dayPay}`);
                        let body = {
                            valor: 1,
                            fecha: new Date(fechaLastRegister), 
                            metodo: 'sistema',
                            businessId: findService.businessId,
                            serviceId: findService.id
                        }
                        axios.post('http://192.168.100.12:3000/addPay/gastos/services', body)
                        .catch(err => {
                            console.log(err);
                            console.log('Error al registrar');
                        })
                        return res.status(200).json(findService);
                        
                    }

                }else{
                    return res.status(200).json(findService);
                }
            }

        }catch(err){
            res.status(500).json(err);
        }
    },

    async createServiceForBusiness(req, res){
        try {
            const { businessId, name, dayPay, dayDisponibility, description } = req.body;
            if(!businessId || !name || !dayDisponibility) return res.status(501).json({msg: 'No puedes dejar los campos vacios'});

            const searchBusiness = await business.findByPk(businessId);

            if(!searchBusiness) return res.status(404).json({msg: 'No hemos encontrado esta tienda.'});

            const createService = await service.create({
                name,
                description,
                dayPay,
                dayDisponibility,
                active: 'active',
                businessId
            })
            .catch((err) => {
                res.status(500).json(err);
            });
            res.status(200).json(createService);

        }catch(err){
            console.log(err);
            res.status(500).json(err);
        }
    },

    async addPayToServices(req, res){
        try{
            const { businessId, serviceId, valor, fecha, metodo} = req.body;

            const searchServices = await service.findOne({
                where: {
                    id: serviceId,
                    businessId
                }
            });
            if(!searchServices) return res.status(404).json({msg: 'No hemos encontrado esta información.'});
            const addPayToService = await PayService.create({
                valor,
                fecha, 
                metodo,
                serviceId
            })
            .then(async (resp) => {
                if(resp.valor == 1){
                    const updateService = await service.update({
                        active: 'alert'
                    }, {where: {id: searchServices.id, businessId: businessId}});

                    return updateService;
                }else if(resp.valor > 1){
                    
                    const updateService = await service.update({
                        active: 'active'
                    }, {where: {id: searchServices.id, businessId: businessId}});

                    return updateService;
                }

            })
            .catch((err) => {
                console.log(err);
                req.status(500).json(err);
            })
            res.status(200).json(addPayToService);

        }catch(err){
            res.status(500).json(err);
        }
    },

    async getPayToServicesByMonth(req, res){
        try{
            const { businessId, date} = req.params;
            if(!businessId || !date) return res.status(501).json({msg: 'No puedes dejar campos vacios'});
            const inicio = String(date+'-01');
            const fin = String(date+'-31');

            if(date.length > 7 || date.length < 7) return res.status(501).json({msg: 'Fecha no valida'})
            
            const searchPagoServices = await PayService.findAll({
                where: {
                    fecha: {
                        [Op.lt]: new Date(fin),
                        [Op.gt]: new Date(inicio)
                    },
                },
                include: [{
                    model: service,
                    as: 'service',
                    include: [{
                        model: business,
                        as: 'business',
                        where: {
                            id: businessId
                        }
                    }],
                    order: [[{model: PayService, as: 'pagos'}, 'fecha', 'DESC']], // Ordenamos en orden descendente.             

                }],

            });
            if(!searchPagoServices.length) return res.status(404).json({msg: 'No hemos encontrado nada'});
            res.status(200).json({searchPagoServices});
        }catch(err){
            console.log(err);
            res.status(500).json(err);
        }
    }
} 