// const { promisify } = require('util');

module.exports = (lista) => {
   //  const setAsync = promisify(lista.set).bind(lista);
   //  const existsAsync = promisify(lista.exists).bind(lista);
   //  const getAsync = promisify(lista.get).bind(lista);
   //  const delAsync = promisify(lista.del).bind(lista);
   // const prefix = prefix;
   return {
      async adiciona(chave, valor, dataExpiracao, prefix) {
         // const prefixAllowlist = 'allowlist-refresh-token:';
         await lista.set(prefix.concat(chave), valor);
         lista.expireAt(chave, dataExpiracao);
      },

      async buscaValor(chave, prefix) {
         // const prefix = 'allowlist-refresh-token:';
         return lista.get(prefix.concat(chave));
      },

      async contemChave(chave, prefix) {
         // const prefix = 'allowlist-refresh-token:';
         const resultado = await lista.exists(prefix.concat(chave));
         return resultado === 1;
      },

      async deleta(chave, prefix) {
         // const prefix = 'allowlist-refresh-token:';
         return await lista.del(prefix.concat(chave));
      },
   };
};
