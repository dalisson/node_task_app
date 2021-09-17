const express = require('express')

const Task = require('../models/task')

const auth = require('../middleware/auth')

const taskRouter = new express.Router()



taskRouter.post('/tasks', auth,  async (req, res)=>{
    const task= new Task({...req.body, owner : req.user._id})

    try{
        await task.save()
        res.status(201).send()
    }catch(e){
        res.status(400).send(e)
    }
})


taskRouter.get('/tasks', auth, async (req, res)=>{
    const match = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }


    sort = {}
    try{
        if(req.query.sortBy){
            const splits = req.query.sortBy.split(':')
            sort[splits[0]] = splits[1] === 'desc' ? -1 : 1
        }

    }catch(err){
        sort = {}
    }
    

    const skip = req.query.skip || 0
    const limit = req.query.limit || 0
    try{
        await req.user.populate({
            path : 'tasks',
            match,
            options :{
                limit: parseInt(limit),
                skip : parseInt(skip*limit),
                sort 
            }
        })
        res.send(req.user.tasks)
    }catch(err){
        console.log(err)
        res.status(404).send()
    }
})
taskRouter.get('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id
    try{
        const task = await Task.findOne({_id, owner: req.user._id})
        res.send(task)
    }catch(err){
        res.status(404).send()
    }
})



taskRouter.patch('/tasks/:id', async (req, res)=>{
    const currentUpdates = Object.keys(req.body)
    const allowedUpdates = ['description', 'complete']
    const isAllowed = currentUpdates.every((value) =>{
        return allowedUpdates.includes(value)
    })
    if(!isAllowed){
        return res.status(400).send()
    }

    const _id = req.params.id
    try{
        
        const task = await Task.findOne({_id, owner : req.user._id})
         
        if(!task){
            return res.status(404).send()
        }

        currentUpdates.forEach((val) =>{
            task[val] = req.body[val]
        })

        await task.save()
       
        res.send(task)
    }catch(err){
        res.status(500).send()
    }
})

taskRouter.delete('/tasks/:id', auth, async (req, res)=>{
    try{
        const task = await Task.findByIdAndDelete({_id : req.params.id, owner : req.user._id})
        if(!task){
            return res.status(404).send('task not found')
        }
        res.send(task)
    }catch(err){
        res.status(500).send()
    }
})

module.exports = taskRouter