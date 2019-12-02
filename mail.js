
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'altreuon.ceo@gmail.com',
    pass: 'cmrit1234'
  }
});

//Subject , Text and Form is always dynamic
const sendMail = (email , subject , text , name ,  cb) => {



	var mailOptions = {
  from: email,
  to: email,

  subject: (subject!="admin's response") ? "Altrueon #"+String(parseInt(Math.random()*10000))+ " ticket" : "Altrueon Support",
  text: (subject!="admin's response") ? "Hi "+name+ "! \nYour query regarding "+subject.toLowerCase()+" has been received. We'll get back to you soon." : text
  };

  transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log(info);
  }
  });

};

module.exports = sendMail ;
