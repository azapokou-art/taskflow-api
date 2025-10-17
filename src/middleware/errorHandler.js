const errorHandler = (error, req, res, next) => {
console.error('ERROR CAPTURADO:', error);

res.status(500).json({
error: 'Erro interno do servidor',
message: error.message
});
};

module.exports = errorHandler;