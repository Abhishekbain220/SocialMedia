let mongoose=require("mongoose")
mongoose.connect("mongodb+srv://abhi123:abhi123@cluster0.gsgs3bg.mongodb.net/social?retryWrites=true&w=majority&appName=Cluster0")
// mongoose.connect("mongodb://0.0.0.0/social")
.then(()=>{
    console.log("Database Connection Established")
})
.catch((error)=>{
    console.log(error.message)
})