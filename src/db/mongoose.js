const mongoose = require('mongoose')

const connectionURL = process.env.MONGO_CONNECTION
const database = 'task-manager'

mongoose.connect(connectionURL+'/task-manager-api', {
    useNewUrlParser : true
})


