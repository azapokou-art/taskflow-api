const Joi = require('joi');

const defaultMessages = {
    "any.required": "{{#label}} is required!!",
    "string.empty": "{{#label}} can't be empty!!",
};

const criarUsuarioSchema = Joi.object({
        nome: Joi.string().min(2).max(100).required().messages(defaultMessages),
        email: Joi.string().email().required().messages(defaultMessages),
        senha: Joi.string().min(1).required().messages(defaultMessages)
});

const loginSchema = Joi.object({
        email: Joi.string().email().required().messages(defaultMessages),
        senha: Joi.string().required().messages(defaultMessages)
});

module.exports = { criarUsuarioSchema, loginSchema };
