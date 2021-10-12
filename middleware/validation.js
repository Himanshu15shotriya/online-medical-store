module.exports = (req,res,next)=> {
    if((req.body.email.includes('@')) && req.body.email.includes('.')){
        if((req.body.password).length >= 6){
            next()
        }
        else{
            res.send({
                success : false,
                message : "Password must be atleast 6 characters"
            })
        }
    }
    else{
        res.send({success : false, message : "Email must include '@' and '.'"})
    }
}