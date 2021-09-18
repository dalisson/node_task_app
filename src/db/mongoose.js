const mongoose = require('mongoose')

const connectionURL = process.env.MONGO_DB_CONN


mongoose.connect(connectionURL, {
    useNewUrlParser : true
})


