import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = mongoose.Schema({
    name:{
        type:String,
        trim:true,
        minlength:2,
        maxlength:50,
        required:[true,"Name is required"]
    },
    email:{
        type:String,
        trim:true,
        required:[true,"Email is required"],
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minlength:8,

    },
    
    isVerified:{
        type:Boolean,
        default:false 
    },
    verificationToken:{
        type:String,
        select:false
    },
    refreshToken:{
        type:String,
        select:false
    },
    resetPasswordToken:{
        type:String,
        select:false 
    },
    resetPasswordExpires:{
        type:Date,
        select:false
    }
},{timestamps:true})

// before saving the password into db hash the password.
userSchema.pre("save", async function(){
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password,12);
})

userSchema.methods.comparePassword=async function(clearTextPassword){
    return await bcrypt.compare(clearTextPassword,this.password)
}

export default mongoose.model("User",userSchema)