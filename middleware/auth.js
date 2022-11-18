const jwt = require("jsonwebtoken");

module.exports = (req,res,next)=>{
    const key = req.headers.key;

    if(key){
       const decodedtoken = jwt.verify(key,"todo");
    //    console.log(decodedtoken);
       req.user= decodedtoken;
    }
    else{
        res.status(400).json({
            msg: "unautherize user"
        })
    }
    return next();
}