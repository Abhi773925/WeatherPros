const mongoose=require("mongoose"); 
 
mongoose.connect("mongodb://127.0.0.1:27017/RegistrationPage") 
.then(()=>{ 
    console.log("Connection succesful"); 
}).catch((err)=>{ 
    console.log(`No connection ${err}`) 
}) 
 
const signupsch = new mongoose.Schema({ 
    fname:{ 
        type:String, 
        required:true, 
        trim:true 
    }, 
    lname:{ 
        type:String, 
        required:true, 
        trim:true 
    }, 
    email: { 
        type: String, 
        required: true, 
        unique: true, // Email should be unique 
        trim: true 
    }, 
    password: { 
        type: String, 
        required: true, 
        trim: true 
    } 
    }) 
const Student = mongoose.model("RegisterationDetails", signupsch); 
module.exports = Student;