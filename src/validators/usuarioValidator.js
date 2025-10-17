const Joi = require('joi');
const criarUsuarioSchema = Joi.object({
nome: Joi.string().min(2).max(100).required(),
email: Joi.string().email().required(),
senha: Joi.string().min(1).required()
});

const loginSchema = Joi.object({
email: Joi.string().email().required(),
senha: Joi.string().required()
});

module.exports = { criarUsuarioSchema, loginSchema };