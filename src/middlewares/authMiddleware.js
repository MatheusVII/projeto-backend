const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader) {
            return res.status(401).json({ error: "Token nao fornecido" });
        }

        const [ scheme, token ] = authHeader.split(" ");

        if(!/^Bearer$/i.test(scheme)){
            return res.status(401).json({ error: "Token mal formatado" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
}

module.exports = authMiddleware;