const express = require('express');
const bodyParser = require('body-parser');
const {Sequelize,  DataTypes, INTEGER } = require('sequelize');
const { getBusiness, createBusiness, getBusinessById, updateBusiness } = require('./controllers/business');
const { createInventaryBox, getInventaryById, getInventary } = require('./controllers/inventary');
const { getMovements, createMovement, getMovementsId } = require('./controllers/movimientos');
const { getPayrolls, createPayroll, createPayrollAll } = require('./controllers/nomina');
const { getPeople, getPersonById, createProfile, getMovementstoProfile, Register, SingIn, getPeopleById } = require('./controllers/people');
const { addStock, GetStockByMonth } = require('./controllers/productDetails');
const { getProductsById, createProductToInventary, getProductoForInfomationId, updateHowManyProductoForSell } = require('./controllers/productInventary');
const { getSalaries, createSalary } = require('./controllers/salary');
const { business, db, Op } = require('./db');
const { getCategories, createCategory, getCategoryById } = require('./controllers/category');
const { getItems, createItem, addProductToReceta, updateProductToItems, updateStateProduct } = require('./controllers/items');
const { newQrForMesa, createQRForBusiness, getQRById, getBusinessPrincipal, UpdateStateMesa } = require('./controllers/QR');
const { getCarByQR, addProductToCar, updateCarToWaiting, updateCarToPay, updateCarToWannaPay, getAllCarsByBusiness, getCarsWidth, getAllValorCarByMonth } = require('./controllers/car');
const { addProductSimpleFunction, deleteProductoByCar, updateProductToDelivered } = require('./controllers/chosee');
const { getRecetaByItem, getItemByCar } = require('./controllers/receta');
const { getServicesOfBusiness, createServiceForBusiness, addPayToServices, getPayToServicesByMonth, getServiceById } = require('./controllers/service');
const { getSellsByBusiness, createSellByBusinessId, addProductToSell, updateCarToFinish, getSellsByMonth } = require('./controllers/sell');

const PORT = process.env.PORT || 3001; 
const app = express();
app.use(express.json()); 


app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});


app.get('/', (req, res)  => {
    res.send('probemos');
})

app.get('/business', getBusiness);
app.get('/business/:code', getBusinessById);
app.post('/businessCreate', createBusiness);    // CREATE
app.put('/business/', updateBusiness);          // UPDATE

// People

app.get('/people', getPeople);
app.get('/peopleById/:numberDocument/:businessId', getPeopleById);
app.post('/api/signIn', SingIn);
app.post('/api/signUp', Register);

app.get('/person/:document', getPersonById);
app.get('/person/:doc/movements', getMovementstoProfile);
app.post('/createPerson', createProfile);

// Salary
app.get('/salaries', getSalaries);
app.post('/createSalary', createSalary);

// Movements
app.get('/movements/:day', getMovements);
app.get('/movement/:id/:business/:day', getMovementsId);
app.post('/createMovements', createMovement);

// Nómina
app.get('/payrolls', getPayrolls);
app.post('/createPayroll/:day', createPayroll);

// Inventario
app.get('/inventary/:businessId/', getInventary); // Obtener todas las cajas de inventario
app.get('/inventary/:business/:name', getInventaryById); // Obtener caja por id
app.post('/createInventaryBox', createInventaryBox); // Crear caja 

// Producto
app.get('/inventary/:business/:name/:id', getProductsById);
app.post('/inventary/createProduct/new', createProductToInventary)

// PRODUCTOS Y DETALLES
app.get('/producto/:id', getProductoForInfomationId)
app.put('/producto/updateBySell/:id/:cantidadUsada', updateHowManyProductoForSell);

// Registrar producto
app.post('/add/stock', addStock);
app.get('/stock/:businessId/:year/:month',GetStockByMonth);


// PARA CLIENTES - VENDER
// Categorías Para vender
app.get('/categories/:business', getCategories);
app.get('/category/:name/:businessId', getCategoryById);

app.post('/category', createCategory);

// Items - 
app.get('/items/:categoryId', getItems);    // Obtener items de una categoria
app.post('/items', createItem);                     // Crear items de una categoria
app.put('/items/update', updateProductToItems);     // Actualizar carácteristicas del producto.
app.put('/items/update/state', updateStateProduct);

// Add to receta
app.post('/receta', addProductToReceta);
app.get('/receta/:id', getRecetaByItem);
app.put('/receta/map/restToInventary/:itemId/:cantidadItems', getItemByCar); 

// QR y Número mesa.
app.get('/QR/:business',newQrForMesa);
app.get('/QR/:businessId/:reference', getQRById);
app.get('/QRP/:name', getBusinessPrincipal);
app.post('/QR/create', createQRForBusiness);


// Pasar de estado 1 a 2 QR 
// 1: Mesa disponible 
// 2: Mesa en uso
app.put('/QR/UpdateState/:businessId/:reference', UpdateStateMesa);

// chosee 
app.post('/chosee', addProductSimpleFunction);
app.delete('/chosee/delete/:carId/:itemId', deleteProductoByCar);
app.put('/chosee/update/toDelivered/:carId/:itemId', updateProductToDelivered);

// QR, USING MESA AND ADD PRODUCTO
app.get('/car/:qrId', getCarByQR); // Mostrar carrito.
app.get('/car/business/:businessId/:date', getAllCarsByBusiness);
app.get('/car/getValor/:businessId/:date', getAllValorCarByMonth) // Obtener el mes y toda la producción del mismo;
app.get('/car/buss/get/:businessId/', getCarsWidth);              // Funcion para traer todos los pagos desde que se creo el business
app.put('/car/update/state/:carId', updateCarToWaiting);
app.put('/car/update/iwannapay/:carId', updateCarToWannaPay);
app.put('/car/update/stateandmethod/:carId/:metodo', updateCarToPay); 



app.post('/car/addProducto', addProductToCar); // Agregar producto con varías validaciones.


// Servicios
app.get('/gastos/services/:businessId', getServicesOfBusiness);
app.post('/create/gastos/services/', createServiceForBusiness);
app.post('/addPay/gastos/services', addPayToServices); 
app.get('/gastos/services/filter/:businessId/:date', getPayToServicesByMonth);
app.get('/gastos/services/:businessId/:servicesId', getServiceById);

// SELL
app.get('/sell/business/:businessId', getSellsByBusiness); // Obtener el sell actual del carrito.
app.get('/sell/business/:businessId/:date', getSellsByMonth);
app.post('/sell/post/business/:businessId', createSellByBusinessId); // Crear carrito SELL con el id del negocio
app.post('/sell/post/addItem', addProductToSell);
app.put('/sell/update/sell/:businessId', updateCarToFinish);
const server = app.listen(PORT, () => {
    db.sync();
    console.log(`Server running on port ${PORT}`);
});


// socket io
const SocketIO = require('socket.io');
const io = SocketIO(server);

// WebSockets
io.on('connection', () => {
  console.log('new connection');
}) 