const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendWelcomeMail, sendGoodByeMail} = require('../emails/mails')


const upload = multer({
    limits : {
        fileSize : 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Only jpg, jpeg and png files up to 1MB are supported'))
        }

        cb(undefined, true)
    }
})

const router = new express.Router()
router.post('/users', async (req, res)=>{
    const user = new User(req.body)
    try{
        sendWelcomeMail(req.body.email, req.body.name)
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({user,token})
    }catch(e){
        console.log(e)
        res.status(400).send(e)

    }
    
})

router.post('/users/login', async (req, res)=>{

    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        await user.save()
        res.send({user, token})
    }catch(err){
        res.status(400).send()
    }

})


router.get('/users/me', auth, async (req, res)=>{
    res.send(req.user)
    
})




router.patch('/users/me', auth, async (req, res)=>{
    const currentUpdates = Object.keys(req.body)
    const allowedUpdates = ['name', 'password', 'age', 'email']
    const isAllowed = currentUpdates.every((value) =>{
        return allowedUpdates.includes(value)
    })
    if(!isAllowed){
        return res.status(400).send()
    }
    try{

        const user = req.user

        currentUpdates.forEach((val) =>{
            user[val] = req.body[val]
        } )


        await user.save()
        
        res.send(user)
    }catch(err){
        res.status(500).send()
    }
})


router.delete('/users/me', auth, async (req, res)=>{
    try{
        
        await req.user.remove()
        sendGoodByeMail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(err){
        res.status(500).send()
    }
})

router.post('/users/logout', auth, async (req, res) =>{
    try{
        req.user.tokens = req.user.tokens.filter((value) =>{
            return value.token != req.token
        })
        await req.user.save()
        res.send('logged out')
    }catch(err){
        res.status(404).send()
    }
})
router.post('/users/logoutAll', auth, async (req, res) =>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send('disconnected')
    }catch(err){
        res.status(404).send()
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height : 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (err, req, res, next)=>[
    res.status(400).send({error : err.message})
])


router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send(req.user)
}, (err, req, res, next)=>[
    res.status(400).send({error : err.message})
])

module.exports = router