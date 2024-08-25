let mongoose=require("mongoose")
let commentSchema=mongoose.Schema({
    postComment:String,
    user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    post:{type:mongoose.Schema.Types.ObjectId,ref:"post"}
    
},{timestamps:true})
module.exports=mongoose.model("comment",commentSchema)