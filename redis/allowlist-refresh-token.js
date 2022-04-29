const redis = require('redis');
const manipulaLista = require('./manipula-lista');

const allowlist = redis.createClient({
   port: process.env.REDIS_PORT,
   host: process.env.REDIS_HOST,
   //  prefix: 'allowlist-refresh-token:', não funcionou!!!
});

(async () => {
   await allowlist.connect();
})();

allowlist.on('connect', () => console.log('::> allowlist-refresh-token Connected'));
allowlist.on('error', (err) => console.log('<:: allowlist-refresh-token Error', err));

// const prefix = 'allowlist-refresh-token';
module.exports = manipulaLista(allowlist);
