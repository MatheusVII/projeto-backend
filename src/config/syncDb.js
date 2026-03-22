const sequelize = require('../models');

(async () => {
    try{
        await sequelize.sync({logging: console.log });
        console.log('Tabelas sicronizadas');
    } catch(err) {
        console.log("Erro ao sicronizar: ", err);
    }

})();