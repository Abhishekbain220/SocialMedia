let mongoose=require("mongoose")
let plm=require("passport-local-mongoose")
let userSchama=mongoose.Schema({
    username:String,
    email:String,
    password:String,
    profileImage:{
        type:String,
        default:"default.jpg"
    },
    post:[{type:mongoose.Schema.Types.ObjectId,ref:"post"}]
},{timestamps:true})
userSchama.plugin(plm)
module.exports=mongoose.model("user",userSchama)