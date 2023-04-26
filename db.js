const { Sequelize, Op} = require('sequelize');
const modelBusiness = require('./model/business');
const modelPerson = require('./model/personal');
const modelSalary = require('./model/salary');
const modelMovement = require('./model/movement');
const modelPayroll = require('./model/nomina');
const modelInventary = require('./model/inventary');
const modelProduct = require('./model/productInventary');  
const modelStock = require('./model/productDetails');
const modelCar = require('./model/car');
// Para vender
const modelCategory = require('./model/categoryToSell');
const modelItem = require('./model/items');
// Relación para productos a vender y producto en inventario
const modelReceta = require('./model/receta');
// QR 
const modelQR = require('./model/QR');
// PRODUCTOS Y QR
const modelChosee = require('./model/chosee');

// ------- GASTOS -----------------
// Servicios
const modelService = require('./model/service');
const modelPayService = require('./model/ServicePay');

// SELLS 
const modelSell = require('./model/sell');
const modelProductSell = require('./model/sellProducts');


const sequelize = new Sequelize(`postgresql://postgres:DZn7RIWDMDrzRyHpHKcq@containers-us-west-163.railway.app:7240/railway`, {
    logging: false,
});


// Modelos
modelBusiness(sequelize);   // Business
modelPerson(sequelize);     // Persona
modelSalary(sequelize);     // Salario
modelMovement(sequelize);   // Movimientos económicos
modelPayroll(sequelize);    // Nomina
modelInventary(sequelize);  // Cajas de inventario (Inventario) 
modelProduct(sequelize);    // Productos del inventario
modelStock(sequelize);      // Existencias en inventario
//  MODELOS PARA VENDER
modelCategory(sequelize);   //  Categorías de menu
modelItem(sequelize);       //  Items categoría
//  MODELO DE RECETA
modelReceta(sequelize);
// MODELO QR Y MESA
modelQR(sequelize);
// MODEL CAR PARA MESAS
modelCar(sequelize);
// MODEL QR PRODUCTS
modelChosee(sequelize);

// MODEL SERVICES 
modelService(sequelize);
modelPayService(sequelize);

// SELL
modelSell(sequelize);
modelProductSell(sequelize);
const { business, person, salary, movement, payroll, inventary, product, stock, category, item, receta, QR, car, chosee, service, PayService, sell, ProductSell} = sequelize.models;

business.hasMany(person, {as: "trabajadores", foreignKey:"businessId"});
person.belongsTo(business, {as: "business"});


// Relacion Persona - Salario | UNO a UNO
person.hasOne(salary); // Esto añade una clave foranea, del tipo de salaryId a la tabla ubication
salary.belongsTo(person);

// Relacion BUSINESS - Movimientos económicos - Uno a muchos.
business.hasMany(movement, {as: "movimientos", foreignKey:"businessId"}); // Movimientos : Movimientos económicos.
movement.belongsTo(business, {as: "business"});

// Relacion Person - Movimientos económicos - Uno a muchos.
person.hasMany(movement, {as: "movimientos", foreignKey:"personId"}); // Movimientos : Movimientos económicos.
movement.belongsTo(person, {as: "persona"}); 

// Relacion business - Cajas de inventario
business.hasMany(inventary, {as: "inventario", foreignKey:"businessId"}); // Inventario : Cajas de inventario
inventary.belongsTo(business, {as: "business"});

// Relacion Inventario (Box)- Producto | Uno a Muchos
inventary.hasMany(product, {as: "productos", foreignKey:"boxId"});
product.belongsTo(inventary, {as: "caja"});

// Relación Productos y sus detalles (Stock);
product.hasMany(stock, { as: "registros", foreignKey:"stockId" });
stock.belongsTo(product, { as: "producto" }); 


// Relación Business y detalles de productos (Stock);
business.hasMany(stock, { as: "stocks" });
stock.belongsTo(business, { as: "business" });  

// Relacion de business y las categorías para productos
business.hasMany(category, {as: "categorias"});
category.belongsTo(business, {as: "negocio"});

// Relacion de la carta con el productos - items
category.hasMany(item, {as: "productos"});
item.belongsTo(category, {as: "carta"});

// Asociación de productos a vender y productos en el inventario:
item.belongsToMany(product, { through: 'receta' }); 
product.belongsToMany(item, { through: 'receta' });

// Relacion business - QR y sus mesas
business.hasMany(QR, {as: "mesas"}); // Mesas : Códigos QR disponibles.
QR.belongsTo(business, {as: "business"}); 


// Relación MESA - CAR
QR.hasMany(car, {as: "car"}); // QR ES MESA
car.belongsTo(QR, {as: "mesa"}); // CARRITO

business.hasMany(car, {as: "ventas"}); // QR Y LAS VENTAS
car.belongsTo(business, {as: 'business'}); // LAS VENTAS TIENE EL CAR


// Asociación de productos a vender y productos en el inventario:
car.belongsToMany(item, { through: 'chosee' }); 
item.belongsToMany(car, { through: 'chosee' });

// asosicación de los servicios y el business
business.hasMany(service, {as: "servicios"});
service.belongsTo(business, {as: "business"});


// asosicación de los pagos a los servicios
service.hasMany(PayService, {as: "pagos"});
PayService.belongsTo(service, {as: "service"});

// Relacionado con las ventas registradas directament.
business.hasMany(sell, {as: 'sell'});
sell.belongsTo(business, {as: 'business'});

// Relacionando las sell con los item
sell.belongsToMany(item, { through: 'ProductSell' }); 
item.belongsToMany(sell, { through: 'ProductSell' });
module.exports = {
    ...sequelize.models,
    db: sequelize,
    Op
}