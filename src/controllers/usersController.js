const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require("../config/env.config");
const nodemailer = require('nodemailer');

const User = require("../models/User");

const registerUser = async (req, res) => {
    const { email, name, password, role } = req.body;

    if (!email || !name || !password || !role) {
        return res.status(400).json({
            message: `Input tidak boleh kosong!`
        });
    }

    const user = await User.findOne({ email: email});
    if (user) {
        return res.status(400).json({
            message: `Email user sudah terpakai!`
        });
    }

    try {
        const token = jwt.sign({ email: email }, env("SECRET_KEY"), { expiresIn: "1h" });
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env("EMAIL_ADDRESS"),
                pass: env("EMAIL_PASSWORD")
            }
        });
        
        const mailOptions = {
            from: env("EMAIL_ADDRESS"),
            to: email,
            subject: 'Verify your Sepuh registration account',
            text: `Click link below to verify your account <a href="http://${ env("HOST") }/api/users/verify/${ token }"><a>`
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        const bcryptedPassword = await bcrypt.hash(password, 10);
        const result = await User.create({
            name: name,
            email: email,
            password: bcryptedPassword, 
            role: role,
            balance: 0,
            rating: 0,
            employees: [],
            history: [],
            list: [],
            status: false
        });

        return res.status(200).json({
            ...result,
            verify_link: `http://${ env("HOST") }/api/users/verify/${ token }`
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

const verifyUser = async (req, res) => {
    const { token } = req.params;

    try {
        const decodedToken = jwt.verify(token, env("SECRET_KEY"));

        const result = await User.updateOne({ email: decodedToken.email }, { $set: { status: true } });

        return res.status(201).json(result);
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}
 
const loginUser = async (req, res) => {
    
}

const fetchUser = async (req, res) => {
    
}

const getUser = async (req, res) => {
    
}

const updateUser = async (req, res) => {
    
}

const deleteUser = async (req, res) => {
    
}

module.exports = {
    registerUser,
    verifyUser,
    loginUser,
    fetchUser,
    getUser,
    updateUser,
    deleteUser,
}