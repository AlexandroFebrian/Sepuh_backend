const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require("../models/User");

const registerUser = async (req, res) => {
    const { email, name, password, role } = req.body;

    if (!email || !name || !password || !role) {
        return res.status(400).json({
            message: `Input tidak boleh kosong!`
        });
    }

    try {
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
            status: true
        });

        return res.status(200).json(result);
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
    loginUser,
    fetchUser,
    getUser,
    updateUser,
    deleteUser,
}