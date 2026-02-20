const sanitizeInput = (req, res, next) => {
    const cleanString = (str) => {
        if (typeof str != 'string') return str;

        return str
        .replace(/'/g,"''")
        .replace(/;/g, '')
        .replace(/--/g, '')
        .replace(/\|\|/g, '')
        .substring(0, 255);
    };

    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = cleanString(req.body[key]);
            }
        });
    }

    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = cleanString(req.query[key]);
            }
        });
    }

    next();
};

module.exports = sanitizeInput;
