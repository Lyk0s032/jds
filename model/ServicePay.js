const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('PayService', {
        valor: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fecha: {
            type: DataTypes.DATE
        },
        metodo: {
            type: DataTypes.STRING
        }
    })
}