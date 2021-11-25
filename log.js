const winston = require('winston');

// export a log instance
module.exports = new winston.createLogger({
    level: 'info',
    transports: [
      new (winston.transports.Console)()
    ]});