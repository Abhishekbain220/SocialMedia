let mongoose=require("mongoose")
let postSchema=mongoose.Schema({
    title:String,
    postImage:String,
    user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    like:[{type:mongoose.Schema.Types.ObjectId,ref:"user"}],
    comment:[{type:mongoose.Schema.Types.ObjectId,ref:"comment"}]
    
},{timestamps:true})
module.exports=mongoose.model("post",postSchema)