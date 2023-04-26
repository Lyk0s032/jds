const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('sell', {
        estado: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER
        },
        active: {
            type: DataTypes.STRING,
            allowNull:false
        },
        metodo: {
            type: DataTypes.STRING
        },
        fecha: {
            type: DataTypes.DATE
        }
    })
}