var express = require('express')
var router = express.Router()
var model = require('../db/db')
var sha1 = require('sha1')
var moment = require('moment')
var objectIdToTimestamp = require('objectid-to-timestamp')
var createToken = require('../middleware/createToken')
var checkToken = require('../middleware/checkToken')

// register
const Register = (req, res) => {
	let userRegister = new model.User({
		email: req.body.email,
		password: sha1(req.body.password),
		name: req.body.name,
		birth: req.body.birth,
		recheck: req.body.recheck,
		token: createToken(this.email), // sign
		stock: req.body.stock
	})
	userRegister.create_time = moment(
		objectIdToTimestamp(userRegister._id)
	).format('YYYY-MM-DD HH:mm:ss')

	model.User.findOne(
		{
			email: userRegister.email.toLowerCase()
		},
		(err, doc) => {
			if (err) console.log(err) //TODO:
			if (doc) {
				//TODO:doc === null??
				res.json({
					message: '用户已经存在!不能重复注册'
				})
			} else {
				userRegister.save(err => {
					if (err) {
						res.json({
							success: false,
							message: '注册失败'
						})
					}
					res.json({
						success: true,
						message: '注册成功'
					})
				})
			}
		}
	)
}

// login
const Login = (req, res) => {
	let userLogin = new model.User({
		email: req.body.email,
		password: sha1(req.body.password),
		token: createToken(this.email)
	})
	model.User.findOne({ email: userLogin.email }, (err, doc) => {
		if (err) console.log(err) // TODO: for debug
		if (!doc) {
			res.json({
				code: 4004,
				success: false,
				message: '用户不存在'
			})
		} else if (userLogin.password === doc.password) {
			var name = req.body.email
			doc.time = moment(objectIdToTimestamp(doc._id)).format(
				'YYYY-MM-DD HH:mm:ss'
			)
			res.json({
				code: 2000,
				success: true,
				message: '登录成功',
				token: createToken(name),
				data: doc
			})
		} else {
			res.json({
				code: 4008,
				success: false,
				message: '密码错误'
			})
		}
	})
}

// print all user
const User = (req, res) => {
	model.User.findOne({ email: req.body.email }, (err, doc) => {
		if (err) {
			res.json({
				code: 4004,
				message: '用户不存在'
			})
		}
		res.json({
			code: 2000,
			data: doc,
			message: '欢迎回来'
		})
	})
}

router.post('/register', Register)
router.post('/login', Login)
router.post('/hello', checkToken, User)

module.exports = router
