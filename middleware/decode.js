const jwt = require('jsonwebtoken');

module.exports= (req,res,next)=> {
    var token = req.headers.authorization
    jwt.verify(token,process.env.SECRET, (err,decode) => {
        if(decode){
            req.decode = decode
            next()
        }else{
            res.send("Please log in first");
        }
    })
}