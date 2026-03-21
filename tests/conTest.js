const sequelize = require('../src/config/db.js');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado com sucesso');
  } catch (err) {
    console.error('Erro ao conectar', err);
  }
})();