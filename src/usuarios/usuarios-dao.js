const db = require('../../database');
const { InternalServerError } = require('../erros');

const { promisify } = require('util');
const dbRun = promisify(db.run).bind(db);
const dbGet = promisify(db.get).bind(db);
const dbAll = promisify(db.all).bind(db);

module.exports = {
   async adiciona(usuario) {
      try {
         await dbRun(
            `INSERT INTO usuarios (nome, email, senhaHash, emailVerificado) 
        VALUES (?, ?, ?, ?)`,
            [usuario.nome, usuario.email, usuario.senhaHash, usuario.emailVerificado]
         );
      } catch (erro) {
         throw new InternalServerError('Erro ao adicionar o usuário!');
      }
   },

   async buscaPorId(id) {
      try {
         return await dbGet(`SELECT * FROM usuarios WHERE id = ?`, [id]);
      } catch (erro) {
         throw new InternalServerError('Não foi possível encontrar o usuário!');
      }
   },

   async buscaPorEmail(email) {
      try {
         return await dbGet(`SELECT * FROM usuarios WHERE email = ?`, [email]);
      } catch (erro) {
         throw new InternalServerError('Não foi possível encontrar o usuário!');
      }
   },

   async lista() {
      try {
         return await dbAll(`SELECT * FROM usuarios`);
      } catch (erro) {
         throw new InternalServerError('Erro ao listar usuários!');
      }
   },

   async modificaEmailVerificado(usuario, emailVerificado) {
      try {
         await dbRun('UPDATE usuarios SET emailVerificado = ? WHERE id = ?', [
            emailVerificado,
            usuario.id,
         ]);
      } catch (error) {
         throw new InternalServerError('Erro ao modificar a verificação de e-mail');
      }
   },
   async deleta(usuario) {
      try {
         await dbRun(`DELETE FROM usuarios WHERE id = ?`, [usuario.id]);
      } catch (erro) {
         throw new InternalServerError('Erro ao deletar o usuário');
      }
   },
};

//metodo do primeiro curso
// const db = require('../../database');
// const { InternalServerError } = require('../erros');

// module.exports = {
//   adiciona: usuario => {
//     return new Promise((resolve, reject) => {
//       db.run(
//         `
//           INSERT INTO usuarios (
//             nome,
//             email,
//             senhaHash
//           ) VALUES (?, ?, ?)
//         `,
//         [usuario.nome, usuario.email, usuario.senhaHash],
//         erro => {
//           if (erro) {
//             reject(new InternalServerError('Erro ao adicionar o usuário!'));
//           }

//           return resolve();
//         }
//       );
//     });
//   },

//   buscaPorId: id => {
//     return new Promise((resolve, reject) => {
//       db.get(
//         `
//           SELECT *
//           FROM usuarios
//           WHERE id = ?
//         `,
//         [id],
//         (erro, usuario) => {
//           if (erro) {
//             return reject('Não foi possível encontrar o usuário!');
//           }

//           return resolve(usuario);
//         }
//       );
//     });
//   },

//   buscaPorEmail: email => {
//     return new Promise((resolve, reject) => {
//       db.get(
//         `
//           SELECT *
//           FROM usuarios
//           WHERE email = ?
//         `,
//         [email],
//         (erro, usuario) => {
//           if (erro) {
//             return reject('Não foi possível encontrar o usuário!');
//           }

//           return resolve(usuario);
//         }
//       );
//     });
//   },

//   lista: () => {
//     return new Promise((resolve, reject) => {
//       db.all(
//         `
//           SELECT * FROM usuarios
//         `,
//         (erro, usuarios) => {
//           if (erro) {
//             return reject('Erro ao listar usuários');
//           }
//           return resolve(usuarios);
//         }
//       );
//     });
//   },

//   deleta: usuario => {
//     return new Promise((resolve, reject) => {
//       db.run(
//         `
//           DELETE FROM usuarios
//           WHERE id = ?
//         `,
//         [usuario.id],
//         erro => {
//           if (erro) {
//             return reject('Erro ao deletar o usuário');
//           }
//           return resolve();
//         }
//       );
//     });
//   }
// };
