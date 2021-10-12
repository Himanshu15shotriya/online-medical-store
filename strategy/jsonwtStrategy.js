const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require('mongoose');
const Admin = mongoose.model("myAdmin");
const User = mongoose.model("myUser")


var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;


module.exports = passport =>{
    passport.use("jwt",new JwtStrategy(opts,(jwt_payload,done)=>{
        Admin.findOne({_id:jwt_payload.id})
        .then(admin =>{
            if (admin) {
                return done(null, admin);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        })
        .catch(err => console.log(err));
    }));
    passport.use("jwt-2",new JwtStrategy(opts,(jwt_payload,done)=>{
        User.findById(jwt_payload.id)
        .then(user =>{
            if(user){
                return done(null,user);
            }
            return done(null,false)
        })
        .catch(err => console.log(err));
    }));
}

