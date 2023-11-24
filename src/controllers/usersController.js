const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require("../config/env.config");
const nodemailer = require('nodemailer');

const User = require("../models/User");

const registerUser = async (req, res) => {
    const { email, name, password, role } = req.body;

    if (!email || !name || !password || !role) {
        return res.status(400).json({
            message: `Input must not be empty!`
        });
    }

    const user = await User.findOne({ email: email });
    if (user) {
        return res.status(400).json({
            message: `Email is already used!`
        });
    }

    try {
        const token = jwt.sign({ email: email }, env("SECRET_KEY"), { expiresIn: "365d" });
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
            text: `Click link below to verify your account http://${ env("HOST") }/api/users/verify/${ token }`
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        const bcryptedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name: name,
            email: email,
            headline: "",
            password: bcryptedPassword,
            profile_picture: "",
            role: role,
            balance: 0,
            rating: 0,
            account_number: "",
            employees: [],
            history: [],
            list: [],
            status: 0
        });

        return res.status(201).json({
            message: `User successfully registered!`
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

        const user = await User.findOne({ email: decodedToken.email });

        if (user) {
            if (user.status == 1) {
                return res.status(200).json({
                    message: `User already verified!`
                });
            } else if (user.status == -1) {
                return res.status(200).json({
                    message: `User has been banned!`
                });
            }
        } else {
            return res.status(404).json({
                message: `Token has been changed by user, email not found!`
            });
        }

        await User.updateOne({ email: decodedToken.email }, { $set: { status: 1 } });

        return res.status(201).json({
            message: `User successfully verfied!`
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}
 
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: `Input must not be empty!`
        });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(404).json({
            message: `Email have not been registered!`
        });
    }

    try {
        const resultPassword = bcrypt.compareSync(password, user.password);
        if (!resultPassword) {
            return res.status(400).json({
                message: `Incorrect password!`
            });
        } else if (user.status == 0) {
            return res.status(400).json({
                message: `User has not verified their email!`
            });
        } else if (user.status == -1) {
            return res.status(400).json({
                message: `User has been banned!`
            });
        }

        const token = jwt.sign({
            email: email,
            name: user.name,
            headline: user.headline,
            role: user.role,
            profile_picture: user.profile_picture
        }, env("SECRET_KEY"), { expiresIn: "3h" });

        return res.status(200).json({
            name: user.name,
            headline: user.headline,
            email: user.email,
            role: user.role,
            balance: user.balance,
            profile_picture: user.profile_picture,
            rating: user.rating,
            account_number: user.account_number,
            employees: user.employees,
            history: user.history,
            list: user.list,
            status: user.status,
            token: token,
            joined_at: user.create_at
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
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