const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required : true,
        trim : true
    },
    age : {
        type: Number,
        validate(value){
            if(value < 0){
                throw new Error("Error must be a positive number.")
            }
        }
    
    },
    email : {
        type: String,
        unique : true,
        required: true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email")
            }
        }
    },
    password:{
        type: String,
        required : true,
        trim: true,
        minLength : 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error("Invalid Password")
            }
        }
    },
    avatar :{
        type: Buffer
    },
    tokens:[{
        token : {
            type: String,
            required : true
        }
    }]
}, {
    timestamps : true
})
userSchema.statics.findByCredentials = async(email, password) =>{
    const user = await User.findOne({email})

    if(!user){
        throw new Error('no user found by email')
    }


    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('unable to login')
    }

    return user
}

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField : 'owner'
})

userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id : user._id.toString()}, process.env.JWT_KEY)

    user.tokens = user.tokens.concat({token})

    return token

}
userSchema.methods.toJSON = function (){
    const user = this.toObject()
    
    delete user.password
    delete user.tokens

  
    return user

}


//hash password
userSchema.pre('save', async function (next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

userSchema.pre('remove', async function (next){
    await Task.deleteMany({owner : this._id})
    next()
})



const User = mongoose.model('User', userSchema)

module.exports = User