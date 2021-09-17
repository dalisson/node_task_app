const sgMail = require('@sendgrid/mail')
const sendGridKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridKey)

const sendWelcomeMail = (email, name)=>{
    sgMail.send({
        to:email,
        from : 'dalissonfigueiredo@gmail.com',
        subject : 'Wellcome',
        text : `Hello Mr./\Ms ${name}, welcome to the task app`
    }).then().catch((err) =>{
        console.log(err)
    })
}

const sendGoodByeMail = (email, name)=>{
    sgMail.send({
        to:email,
        from : 'dalissonfigueiredo@gmail.com',
        subject : 'farewell',
        text : `Farewell Mr./\Ms ${name} we are sorry to see you go.`
    }).then().catch((err) =>{
        console.log(err)
    })
}

module.exports = {
    sendWelcomeMail,
    sendGoodByeMail
}