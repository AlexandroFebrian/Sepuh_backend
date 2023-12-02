const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require("../config/env.config");
const nodemailer = require('nodemailer');
const fs = require('fs').promises;

const User = require("../models/User");
const Post = require("../models/Post");
const { ObjectId } = require('mongodb');
const { isValidObjectId } = require('mongoose');

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
            date_of_birth: null,
            bio: "",
            city: "",
            country: "",
            last_education: "",
            current_education: "",
            field_of_study: "",
            year_of_study: 0,
            header_picture: "",
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
        const resultPassword = bcrypt.compareSync(password, user._doc.password);
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
            ...user._doc,
            password: undefined,
            header_picture: user.header_picture == "" ? "" : `${ env("HOST") }/api/public/${ user.header_picture }`,
            profile_picture: user.profile_picture == "" ? "" : `${ env("HOST") }/api/public/${ user.profile_picture }`
        }, env("SECRET_KEY"), { expiresIn: "3h" });

        return res.status(200).json({
            token: token
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: `Input must not be empty!`
        });
    }

    try {;
        if (username != "admin" || password != env("ADMIN_PASSWORD")) {
            return res.status(400).json({
                message: `Incorrect username or password!`
            });
        }

        const token = jwt.sign({
            admin_password: bcrypt.hashSync(env("ADMIN_PASSWORD"), 10)
        }, env("SECRET_KEY"), { expiresIn: "3h" });

        return res.status(200).json({
            token: token
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

const fetchUser = async (req, res) => {
    const users = await User.find({}, {
        _id: 0,
        password: 0
    });

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        user.header_picture = user.header_picture == "" ? "" : `${ env("HOST") }/api/public/${ user._doc.header_picture }`;
        user.profile_picture = user.profile_picture == "" ? "" : `${ env("HOST") }/api/public/${ user._doc.profile_picture }`;
    }

    return res.status(200).json({
        users: users
    });
}

const banUser = async (req, res) => {
    const { email } = req.params;

    if (email == "") {
        return res.status(400).json({
            message: `Email must not be empty!`
        });
    }

    await User.updateOne({ email: email }, { $set: { status: -1 } });

    return res.status(200).json({
        message: `Successfully banned ${email}!`
    });
}

const unbanUser = async (req, res) => {
    const { email } = req.params;
    
    if (email == "") {
        return res.status(400).json({
            message: `Email must not be empty!`
        });
    }

    await User.updateOne({ email: email }, { $set: { status: 1 } });

    return res.status(200).json({
        message: `Successfully unbanned ${email}!`
    });
}

const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id, {
        _id: 0,
        password: 0
    });

    return res.status(200).json({
        ...user._doc,
        header_picture: user._doc.header_picture == "" ? "" : `${ env("HOST") }/api/public/${ user._doc.header_picture }`,
        profile_picture: user._doc.profile_picture == "" ? "" : `${ env("HOST") }/api/public/${ user._doc.profile_picture }`
    });
}

const getUserProfileByEmail = async (req, res) => {
    const user = await User.findOne({
        email: req.params.email
    }, {
        _id: 0,
        password: 0
    });

    return res.status(200).json({
        ...user._doc,
        header_picture: user._doc.header_picture == "" ? "" : `${ env("HOST") }/api/public/${ user._doc.header_picture }`,
        profile_picture: user._doc.profile_picture == "" ? "" : `${ env("HOST") }/api/public/${ user._doc.profile_picture }`
    });
}

const updateUserProfile = async (req, res) => {
    const user = await User.findOne({
        email: req.user.email
    });

    if (req.body.profile_picture) await fs.unlink(`public/${user.profile_picture}`);
    if (req.body.header_picture) await fs.unlink(`public/${user.header_picture}`);

    await User.updateOne({
        _id: req.user._id
    }, {
        $set: req.body
    });

    return res.status(200).json({
        message: `Successfully update profile`
    });
}

const addToList = async (req, res) => {
    const { post_id } = req.body;

    if (!post_id) {
        return res.status(400).json({
            message: `post_id must not be empty!`
        });
    } else if (!isValidObjectId(post_id)) {
        return res.status(400).json({
            message: `post_id must be valid ObjectId!`
        });
    }
    
    const post = await Post.findById(post_id);

    if (!post) {
        return res.status(404).json({
            message: `Post not found!`
        });
    }

    const user_list = await User.findOne({
        email: req.user.email,
        list: { $in: [new ObjectId(post_id)] }
    });

    if (user_list) {
        return res.status(400).json({
            message: `Post already in list!`
        });
    }

    await User.updateOne({
        _id: req.user._id
    }, {
        $push: {
            list: new ObjectId(post_id)
        }
    });

    return res.status(201).json({
        message: `Successfully add post to list!`
    });
}

const fetchList = async (req, res) => {
    const data = await User.findOne({
        email: req.user.email
    }, {
        _id: 0,
        list: 1
    }).populate({
        path: "list"
    });

    const list = await User.populate(data.list, {
        path: "user_id",
        select: "-password"
    });

    for (let i = 0; i < list.length; i++) {
        const image = [];
        const post = list[i];
        
        for (let j = 0; j < post.image.length; j++) {
            const img = post.image[j];
            image.push(env("HOST") + "/api/public/" + img);
        }
        list[i].image = image;
        
        header_picture = list[i].user_id.header_picture;
        profile_picture = list[i].user_id.profile_picture;
        
        if (!header_picture.includes(env("HOST"))) {
            list[i].user_id.header_picture = header_picture == "" ? "" : `${ env("HOST") }/api/public/${ header_picture }`;
            list[i].user_id.profile_picture = profile_picture == "" ? "" : `${ env("HOST") }/api/public/${ profile_picture }`;
        }
    }

    return res.status(200).json(list.map((item) => {
        return {
            ...item._doc,
            posted_by: item._doc.user_id,
            user_id: undefined
        }
    }));
}

module.exports = {
    registerUser,
    verifyUser,
    loginUser,
    loginAdmin,
    fetchUser,
    banUser,
    unbanUser,
    getUserProfile,
    getUserProfileByEmail,
    updateUserProfile,
    addToList,
    fetchList
}