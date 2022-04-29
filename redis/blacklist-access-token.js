const redis = require('redis');

const blacklist = redis.createClient({
   port: process.env.REDIS_PORT,
   host: process.env.REDIS_HOST,
   // prefix: 'blacklist:',
});

(async () => {
   await blacklist.connect();
})();

blacklist.on('connect', () => console.log('::> blacklist-access-token Connected'));
blacklist.on('error', (err) => console.log('<:: blacklist-access-token Error', err));

const manipulaLista = require('./manipula-lista');
const manipulaBlacklist = manipulaLista(blacklist);

// const { promisify } = require('util');
// const existsAsync = promisify(blacklist.exists).bind(blacklist);
// const setAsync = promisify(blacklist.set).bind(blacklist);

const jwt = require('jsonwebtoken');
const { createHash } = require('crypto');

function geraTokenHash(token) {
   return createHash('sha256').update(token).digest('hex');
}

module.exports = {
   async adiciona(token) {
      const dataExpiracao = jwt.decode(token).exp;
      const tokenHash = geraTokenHash(token);
      console.log(tokenHash, dataExpiracao);
      await manipulaBlacklist.adiciona(tokenHash, '', dataExpiracao, 'blacklist-access-token:');
   },
   async contemToken(token) {
      const tokenHash = geraTokenHash(token);
      return await manipulaBlacklist.contemChave(tokenHash, 'blacklist-access-token:');
   },
};
