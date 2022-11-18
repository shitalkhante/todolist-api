const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 8000;
const bodyparser = require("body-parser");
const cors = require("cors");
const user = require("./model/user.js");
const todos = require("./model/todo.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

mongoose.connect("mongodb+srv://admin:admin@cluster0.a75rhgx.mongodb.net/?retryWrites=true&w=majority", () => console.log("conected to db"));
app.use(bodyparser.json());
app.use(cors());
app.use(bodyparser.urlencoded({extended:true}))

app.post("/register", async (req, res) => {
    try {
        const email = req.body.email;
        const pass = req.body.pass;

        if (email && pass) {
            const response = await user.findOne({ email: email });
            if (response) {
                res.status(300).json({
                    msg: 'email already exist',
                })
            }
            else {
                bcrypt.hash(pass, 10).then(async (hspass) => {
                    const result = await user.create({ email: email, password: hspass })
                    res.status(200).json({
                        msg: 'Registered successfully',
                        data: result
                    })
                })
            }
        } else {
            res.status(400).json({
                msg: "please provide email & password"
            });
        }
    } catch (err) {
        res.status(400).json({
            msg: err
        })
    }
})


app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const pass = req.body.pass;
        if (email && pass) {
            await user.findOne({ email: email })
                .then((data) => {
                    bcrypt.compare(pass, data.password).then((result) => {
                        const token = jwt.sign({ id: data.email }, "todo");
                        res.status(200).json({
                            msg: "login Successfully",
                            token: token
                        })
                    }).catch(error => {
                        res.json({
                            msg: "password incorrect"
                        })
                    })
                })
                .catch((error) => {
                    res.status(300).json({
                        msg: "email is not registered",
                        err: error
                    })
                })
        } else {
            res.status(300).json({
                msg: "please provide email & password"
            });
        }
    } catch (error) {
        res.status(400).json({
            msg: error
        }) 
    }
})

app.post("/inserttodos",auth,async(req,res)=>{
    try {
        const todo = req.body.todo;
        if(todo){
            await todos.create({
                uid:req.user.id,
                activity:todo,
                timetaken:0,
                status:"pending"
            }).then((data)=>{
                res.status(200).json({
                    msg:"inserted success",
                    data
                })
            })
        } else{
            res.status(300).json({
                msg:"provide input"
            })
        }
    } catch (error) {
        res.status(400).json({
            msg:error
        })
    }
})

app.get("/gettodos",auth,async(req,res)=>{
    try {
        const id = req.user.id;
        await todos.find({uid:id})
        .then((data)=>{
            res.status(200).json({
                msg:data
            })
        })
    } catch (error) {
        res.status(400).json({
            msg:error
        })
    }
}) 

app.patch("/update",auth,async(req,res)=>{
    try {
        const obj = req.body;
        if(!obj){
            res.status(300).json({
                msg:"provide data to update"
            })
        }else{
            console.log(req.body);
            await todos.updateOne({_id:req.headers.id},{$set:obj},{ returnOriginal: false })
            .then(data=>{
                res.status(200).json({
                    msg:data 
                })
            })
            .catch(err=>{
                throw err;
            })
        }
    } catch (error) {
        res.status(400).json({
            msg:error 
        })
    }
})

app.listen(port, console.log("server is up"));