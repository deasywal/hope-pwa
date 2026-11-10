const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Konfigurasi akun
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'deasywall1203@gmail.com',
    pass: 'ffmf ouqa vdoq wulk',        
});

// Endpoint untuk menerima perintah kirim email
app.post('/api/send-email', (req, res) => {
  const { email, subject, message } = req.body;

  const mailOptions = {
    from: 'HOMPIS App <email.admin.hompis@gmail.com>',
    to: email,
    subject: subject,
    text: message
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Gagal mengirim email:', error);
      return res.status(500).json({ success: false, error: error.toString() });
    }
    console.log('Email berhasil terkirim: ' + info.response);
    res.status(200).json({ success: true, message: 'Email berhasil dikirim!' });
  });
});

// Menjalankan server di port 3000
app.listen(3000, () => {
  console.log('Server backend berjalan di http://localhost:3000');
});