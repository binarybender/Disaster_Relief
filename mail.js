
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'BobTheBuilder9121@gmail.com',
    pass: 'Ligma^inf'
  }
});

//Subject , Text and Form is always dynamic
const sendMail = (email , subject , text , name ,  cb) => {



	var mailOptions = {
  from: email,
  to: email,
  subject: "Altrueon #"+String(parseInt(Math.random()*10000))+ " ticket",
  text: "Hi "+name+ "! \nYour query regarding "+subject.toLowerCase()+" has been received. We'll get back to you soon."
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
