const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');

const allowlistRefreshToken = require('../../redis/allowlist-refresh-token');
const blacklistAccessToken = require('../../redis/blacklist-access-token');

const { InvalidArgumentError } = require('../erros');

function criaTokenJWT(id, [tempoQuantidade, tempoUnidade]) {
   const payload = { id };
   const token = jwt.sign(payload, process.env.CHAVE_JWT, {
      expiresIn: tempoQuantidade + tempoUnidade,
   });
   return token;
}

async function verificaTokenJWT(token, nome, blacklist) {
   await verificaTokenNaBlacklist(token, nome, blacklist);
   const { id } = jwt.verify(token, process.env.CHAVE_JWT);
   return id;
}

async function verificaTokenNaBlacklist(token, nome, blacklist) {
   if (!blacklist) {
      return;
   }
   const tokenNaBlacklist = await blacklist.contemToken(token);
   if (tokenNaBlacklist) {
      throw new jwt.JsonWebTokenError(`${nome} inválido por logout!`);
   }
}

function invalidaTokenJWT(token, blacklist) {
   return blacklist.adiciona(token);
}

async function criaTokenOpaco(id, [tempoQuantidade, tempoUnidade], allowlist) {
   const tokenOpaco = crypto.randomBytes(24).toString('hex');
   const dataExpiracao = moment().add(tempoQuantidade, tempoUnidade).unix();
   await allowlist.adiciona(tokenOpaco, id, dataExpiracao, 'allowlist-refresh-token:');
   return tokenOpaco;
}

async function verificaTokenOpaco(token, nome, allowlist) {
   const prefix = 'allowlist-refresh-token:';
   verificaTokenEnviado(token, nome);

   const id = await allowlist.buscaValor(token, prefix);
   verificaTokenValido(id, nome);

   return id;
}

async function invalidaTokenOpaco(token, allowlist) {
   const prefix = 'allowlist-refresh-token:';
   await allowlist.deleta(token, prefix);
}

function verificaTokenValido(id, nome) {
   if (!id) {
      throw new InvalidArgumentError(`${nome} inválido!`);
   }
}

function verificaTokenEnviado(token, nome) {
   if (!token) {
      throw new InvalidArgumentError(`${nome} não enviado!`);
   }
}

module.exports = {
   access: {
      nome: 'access token',
      lista: blacklistAccessToken,
      expiracao: [15, 'm'],
      cria(id) {
         return criaTokenJWT(id, this.expiracao);
      },
      verifica(token) {
         console.log(this.lista);
         return verificaTokenJWT(token, this.nome, this.lista);
      },
      invalida(token) {
         return invalidaTokenJWT(token, this.lista);
      },
   },
   refresh: {
      nome: 'refresh token',
      lista: allowlistRefreshToken,
      expiracao: [5, 'd'],
      cria(id) {
         return criaTokenOpaco(id, this.expiracao, this.lista);
      },
      verifica(token) {
         return verificaTokenOpaco(token, this.nome, this.lista);
      },
      invalida(token) {
         return invalidaTokenOpaco(token, this.lista);
      },
   },
   verificacaoEmail: {
      nome: 'token de verificação de e-mail',
      expiracao: [1, 'h'],
      cria(id) {
         return criaTokenJWT(id, this.expiracao);
      },
      verifica(token) {
         return verificaTokenJWT(token, this.nome);
      },
   },
};
