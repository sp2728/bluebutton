'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'production';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};
const mysql = require('mysql2/promise');

let sequelize;

mysql.createConnection({ user: config.username, password: config.password, host:config.host, database:config.database,port:3306 })
.then((connection)=>{
  connection.query('CREATE DATABASE IF NOT EXISTS bluebutton;');
  console.log('Connected to database');

  db.User = require('../models/user')(sequelize, DataTypes)
  sequelize.sync();
})
.then(()=>{
  console.log('Database synced')
})

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
.readdirSync(__dirname)
.filter(file => {
  return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
})
.forEach(file => {
  const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
if (db[modelName].associate) {
  db[modelName].associate(db);
}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
