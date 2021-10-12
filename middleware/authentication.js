module.exports = (req,res,next)=>{
    if(req.user.token === req.headers.authorization){
        next();
    }
    else{
    
        res.send({success:false,message : "Please Signin First"})
    }
}


