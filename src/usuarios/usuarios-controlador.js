const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');

const tokens = require('./tokens');
const { EmailVerificacao } = require('./emails');
const { json } = require('body-parser');

function geraEndereco(rota, token) {
   const baseURL = process.env.BASE_URL;
   return `${baseURL}${rota}${token}`;
}

module.exports = {
   async adiciona(req, res) {
      const { nome, email, senha } = req.body;

      try {
         const usuario = new Usuario({
            nome,
            email,
            emailVerificado: false,
         });

         await usuario.adicionaSenha(senha);

         await usuario.adiciona();

         const token = tokens.verificacaoEmail.cria(usuario.id);
         const endereco = geraEndereco('/usuario/verifica_email', token);
         const emailVerificacao = new EmailVerificacao(usuario, endereco);
         emailVerificacao.enviaEmail().catch((err) => console.log(err));

         res.status(201).json();
      } catch (erro) {
         if (erro instanceof InvalidArgumentError) {
            res.status(422).json({ erro: erro.message });
         } else if (erro instanceof InternalServerError) {
            res.status(500).json({ erro: erro.message });
         } else {
            res.status(500).json({ erro: erro.message });
         }
      }
   },

   async login(req, res) {
      try {
         const accessToken = tokens.access.cria(req.user.id);
         const refreshToken = await tokens.refresh.cria(req.user.id);
         res.set('Authorization', accessToken);
         res.status(200).json({ refreshToken });
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   async logout(req, res) {
      try {
         const token = req.token;
         await tokens.access.invalida(token);
         res.status(204).json();
      } catch (erro) {
         res.status(500).json({ erro: erro.message });
      }
   },

   async lista(req, res) {
      try {
         const usuarios = await Usuario.lista();
         res.json(usuarios);
      } catch (error) {
         res.status(500).json({ erro: error.message });
      }
   },

   async verificaEmail(req, res) {
      try {
         const usuario = req.user;
         await usuario.verificaEmail();
         res.status(200).json();
      } catch (error) {
         res.status(500).json({ erro: error.message });
      }
   },

   async deleta(req, res) {
      try {
         const usuario = await Usuario.buscaPorId(req.params.id);
         await usuario.deleta();
         res.status(200).json();
      } catch (erro) {
         res.status(500).json({ erro: erro });
      }
   },
};
