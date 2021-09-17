const express = require('express')
require('./db/mongoose')

const usrRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

// app.use((req, res, next)=>{

//     res.status(503).send("server under maintencance")
// })

app.use(express.json())
app.use(taskRouter)
app.use(usrRouter)

app.listen(port, ()=>{
    console.log(`apps listening on port ${port}`)
})

