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
            text: `Click link below to verify your account ${ env("FRONTEND_HOST") }/verify?token=${ token }`
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
            bank_name: "",
            identity_card: "",
            curriculum_vitae: "",
            portofolio: "",
            notifications: [],
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

    if (!email.includes('@')) {
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
    
    if (!email.includes('@')) {
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

    if (!user) {
        return res.status(404).json({ message: "User not found!" });
    }

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

    if (req.body.profile_picture && user.profile_picture != "") await fs.unlink(`public/${user.profile_picture}`);
    if (req.body.header_picture && user.header_picture != "") await fs.unlink(`public/${user.header_picture}`);

    await User.updateOne({
        _id: req.user._id
    }, {
        $set: req.body
    });

    return res.status(200).json({
        message: `Successfully update profile`,
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

const removeFromList = async (req, res) => {
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

    const user_list = await User.findOne({
        email: req.user.email,
        list: { $in: [new ObjectId(post_id)] }
    });

    if (!user_list) {
        return res.status(400).json({
            message: `Post not in list!`
        });
    }

    await User.updateOne({
        _id: req.user._id
    }, {
        $pull: {
            list: new ObjectId(post_id)
        }
    });

    return res.status(200).json({
        message: `Successfully remove post from list!`
    });
}

const getUserNotifications = async (req, res) => {
    const user = await User.findOne({
        email: req.user.email
    }, {
        _id: 0,
        notifications: 1
    }).populate({
        path: "notifications.from",
        select: "-password"
    });

    for (let i = 0; i < user.notifications.length; i++) {
        const notification = user.notifications[i];
        const from = notification.from;
        profile_picture = from.profile_picture;
        
        if (!profile_picture.includes(env("HOST"))) {
            from.profile_picture = profile_picture == "" ? "" : `${ env("HOST") }/api/public/${ profile_picture }`;
        }
    }

    return res.status(200).json(user.notifications.reverse());
}

const getUserDocument = async (req, res) => {
    const documents = await User.findOne({
        email: req.user.email
    }, {
        identity_card: 1,
        curriculum_vitae: 1,
        portofolio: 1
    });

    return res.status(200).json({
        ...documents._doc,
        identity_card: documents.identity_card == "" ? "" : `${ env("HOST") }/api/public/${ documents.identity_card }`,
        curriculum_vitae: documents.curriculum_vitae == "" ? "" : `${ env("HOST") }/api/public/${ documents.curriculum_vitae }`
    });
}

const updateDocument = async (req, res) => {
    const user = await User.findOne({
        email: req.user.email
    });

    if (req.body.identity_card && user.identity_card != "") await fs.unlink(`public/${user.identity_card}`);
    if (req.body.curriculum_vitae && user.curriculum_vitae != "") await fs.unlink(`public/${user.curriculum_vitae}`);

    await User.updateOne({
        _id: req.user._id
    }, {
        $set: req.body
    });

    return res.status(200).json({
        message: `Successfully update documents`
    });
}

const hireUser = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: `Field email must not be empty!`
        });
    }

    if (req.user.role == "Freelancer") {
        const user = await User.findOne({
            email: email
        });
        if (user.employees.find((e) => e.equals(req.user._id))) {
            return res.status(400).json({
                message: `User is already beeing an employee!`
            });
        } else if (user.notifications.find((n) => n.from.equals(req.user._id) && n.category == "Hired")) {
            return res.status(400).json({
                message: `User is already applied to this company!`
            });
        } else if (req.user.notifications.find((n) => n.from.equals(user._id) && n.category == "Hired")) {
            return res.status(400).json({
                message: `User is already applied to this company!`
            });
        } else {
            await User.updateOne({
                email: email
            }, {
                $push: {
                    notifications: {
                        from: req.user._id,
                        message: `<b>${req.user.name}</b> wants to be your employee!`,
                        category: "Applied",
                        link: `/api/users/profile/${req.user.email}`,
                        read: false,
                        time: new Date(),
                        status: 0
                    }
                }
            });
        }
    } else {
        const user = await User.findOne({
            email: email
        });
        if (req.user.employees.find((e) => e.equals(user._id))) {
            return res.status(400).json({
                message: `User is already beeing an employee!`
            });
        } else if (user.notifications.find((n) => n.from.equals(req.user._id) && n.category == "Hired")) {
            return res.status(400).json({
                message: `User is already applied to this company!`
            });
        } else if (req.user.notifications.find((n) => n.from.equals(user._id) && n.category == "Hired")) {
            return res.status(400).json({
                message: `User is already applied to this company!`
            });
        } else {
            await User.updateOne({
                email: email
            }, {
                $push: {
                    notifications: {
                        from: req.user._id,
                        message: `<b>${req.user.name}</b> wants to hire you to be an employee!`,
                        category: "Hired",
                        link: `/api/users/profile/${req.user.email}`,
                        read: false,
                        time: new Date(),
                        status: 0
                    }
                }
            });
        }
    }

    return res.status(200).json({
        message: `Successfully hire / apply!`
    });
}

const acceptUser = async (req, res) => {
    const { notification_id } = req.body;

    if (!notification_id) {
        return res.status(400).json({
            message: `Field notification_id must not be empty!`
        });
    }

    if (!isValidObjectId(notification_id)) {
        return res.status(400).json({
            message: `Field notification_id must be valid ObjectId!`
        });
    }

    const user = await User.findById(req.user._id);
    const notification = user.notifications.find((n) => n._id.equals(new ObjectId(notification_id)));

    if (!notification) {
        return res.status(400).json({
            message: `Notification not found!`
        });
    } else if (notification.status != 0) {
        return res.status(400).json({
            message: `Notification is already accepted / rejected!`
        });
    } else {
        await User.updateOne({
            _id: req.user._id,
            "notifications._id": notification._id
        }, {
            $set: {
                "notifications.$.status": 1
            }
        });
        if (req.user.role == "Freelancer") {
            await User.updateOne({
                $or: [
                    { _id: req.user._id },
                    { _id: notification.from }
                ]
            }, {
                $push: {
                    notifications: {
                        from: req.user._id,
                        message: `Accept`,
                        category: "Hired Accept",
                        link: `/api/users/profile/${req.user.email}`,
                        read: false,
                        time: new Date(),
                        status: 0
                    }
                }
            });
            await User.updateOne({
                _id: notification.from
            }, {
                $push: {
                    employees: req.user._id
                }
            });
        } else {
            await User.updateOne({
                $or: [
                    { _id: req.user._id },
                    { _id: notification.from }
                ]
            }, {
                $push: {
                    notifications: {
                        from: req.user._id,
                        message: `Accept`,
                        category: "Applied Accept",
                        link: `/api/users/profile/${req.user.email}`,
                        read: false,
                        time: new Date(),
                        status: 0
                    }
                }
            });
            await User.updateOne({
                _id: req.user._id
            }, {
                $push: {
                    employees: notification.from
                }
            });
        }
    }

    return res.status(200).json({
        message: `Successfully accept!`
    });
}

const rejectUser = async (req, res) => {
    const { notification_id } = req.body;

    if (!notification_id) {
        return res.status(400).json({
            message: `Field notification_id must not be empty!`
        });
    }

    if (!isValidObjectId(notification_id)) {
        return res.status(400).json({
            message: `Field notification_id must be valid ObjectId!`
        });
    }

    const user = await User.findById(req.user._id);
    const notification = user.notifications.find((n) => n._id.equals(new ObjectId(notification_id)));

    if (!notification) {
        return res.status(400).json({
            message: `Notification not found!`
        });
    } else if (notification.status != 0) {
        return res.status(400).json({
            message: `Notification is already accepted / rejected!`
        });
    } else {
        await User.updateOne({
            _id: req.user._id,
            "notifications._id": notification._id
        }, {
            $set: {
                "notifications.$.status": -1
            }
        });

        if (req.user.role == "Freelancer") {
            await User.updateOne({
                $or: [
                    { _id: req.user._id },
                    { _id: notification.from }
                ]
            }, {
                $push: {
                    notifications: {
                        from: req.user._id,
                        message: `Reject`,
                        category: "Hired Reject",
                        link: `/api/users/profile/${req.user.email}`,
                        read: false,
                        time: new Date(),
                        status: 0
                    }
                }
            });
        } else {
            await User.updateOne({
                $or: [
                    { _id: req.user._id },
                    { _id: notification.from }
                ]
            }, {
                $push: {
                    notifications: {
                        from: req.user._id,
                        message: `Accept`,
                        category: "Applied Accept",
                        link: `/api/users/profile/${req.user.email}`,
                        read: false,
                        time: new Date(),
                        status: 0
                    }
                }
            });
        }
    }

    return res.status(200).json({
        message: `Successfully reject!`
    });
}

const changePassword = async (req, res) => {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
        return res.status(400).json({
            message: `Input must not be empty!`
        });
    }

    if (old_password == new_password) {
        return res.status(400).json({
            message: `New password must be different from old password!`
        });
    }

    const resultPassword = bcrypt.compareSync(old_password, req.user.password);
    if (!resultPassword) {
        return res.status(400).json({
            message: `Incorrect password!`
        });
    }

    const bcryptedPassword = await bcrypt.hash(new_password, 10);
    await User.updateOne({
        email: req.user.email
    }, {
        $set: {
            password: bcryptedPassword
        }
    });

    return res.status(200).json({
        message: `Successfully change password!`
    });
}

const getEmployees = async (req, res) => {
    const employees = await User.find({
        _id: { $in: req.user.employees }
    }, {
        password: 0
    });

    for (let i = 0; i < employees.length; i++) {
        const employee = employees[i];
        employee.header_picture = employee.header_picture == "" ? "" : `${ env("HOST") }/api/public/${ employee._doc.header_picture }`;
        employee.profile_picture = employee.profile_picture == "" ? "" : `${ env("HOST") }/api/public/${ employee._doc.profile_picture }`;
    }

    return res.status(200).json(employees);
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
    fetchList,
    removeFromList,
    getUserNotifications,
    getUserDocument,
    updateDocument,
    hireUser,
    acceptUser,
    rejectUser,
    changePassword,
    getEmployees
}