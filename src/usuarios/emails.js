const nodemailer = require('nodemailer');

const configuracaoEmailProducao = {
   host: process.env.EMAIL_HOST,
   auth: {
      user: process.env.EMAIL_USUARIO,
      pass: process.env.EMAIL_SENHA,
   },
   secure: true,
};

const configuracaoEmailTeste = (contaTeste) => ({
   host: 'smtp.ethereal.email',
   auth: contaTeste,
});

async function criaConfiguracaoEmail() {
   if (process.env.NODE_ENV === 'production') {
      return configuracaoEmailProducao;
   } else {
      const contaTeste = await nodemailer.createTestAccount();
      return configuracaoEmailTeste(contaTeste);
   }
}

class Email {
   async enviaEmail() {
      const configuracaoEmail = await criaConfiguracaoEmail();
      const transportador = nodemailer.createTransport(configuracaoEmail);
      const info = await transportador.sendMail(this);

      if (process.env.NODE_ENV !== 'production') {
         console.log('URL: ' + nodemailer.getTestMessageUrl(info));
      }
   }
}

class EmailVerificacao extends Email {
   constructor(usuario, endereco) {
      super();
      this.from = '"Blog do código" <betocalestini@hotmail.com>';
      this.to = usuario.email;
      this.subject = 'Verificação de email';
      this.text = `Olá! Para confirmar seu cadastro em nosso Site, clique no link abaixo: ${endereco}`;
      this.html = `<h1>Olá!</h1> <p>Para confirmar seu cadastro em nosso Site, clique no link abaixo:</p></br> <a href="${endereco}">${endereco}</a>`;
   }
}
module.exports = { EmailVerificacao };
