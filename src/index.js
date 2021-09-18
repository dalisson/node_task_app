const app = require('./app')
const port = process.env.PORT

app.listen(port, ()=>{
    console.log(`apps listening on port ${port}`)
})

