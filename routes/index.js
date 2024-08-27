var express = require('express');
var router = express.Router();
let User = require("../models/userSchema")
let passport = require("passport")
let LocalStrategy = require("passport-local")
passport.use(new LocalStrategy(User.authenticate()))
let upload = require("../utils/multer")
let fs = require("fs")
let path = require("path")
let global = path.join(__dirname, "../", "public", "images")
let Post = require("../models/postSchema")
let Comment = require("../models/commentSchema")
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { user: req.user });
});
router.get('/register', function (req, res, next) {
  res.render("register", {
    user: req.user
  })
});
router.post('/register', async function (req, res, next) {
  try {
    let { username, email, password } = req.body
    let newUser = await User.register({
      username,
      email
    }, password)
    await newUser.save()
    res.redirect("/login")
  } catch (error) {
    console.log(error.message)
  }
});
router.get('/login', function (req, res, next) {
  res.render("login", {
    user: req.user
  })
});
router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}), function (req, res, next) {

});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  let post = await Post.find().populate("user")
  res.render("profile", {
    post,
    user: req.user
  })
});
router.get('/userProfile/:uid', isLoggedIn, async function (req, res, next) {
  let userPost = await User.findById(req.params.uid).populate("post")
  res.render("userProfile", {
    userPost,
    user: req.user
  })
});
router.get('/showLikes/:pid', isLoggedIn, async function (req, res, next) {
  let post = await Post.find().populate("user")
  let postLikes = await Post.findById(req.params.pid).populate("like")
  console.log(postLikes.like)

  res.render("showLikes", {
    post,
    postLikes: postLikes.like,
    user: req.user,

  })
});
router.get('/userShowLikes/:pid/:uid', isLoggedIn, async function (req, res, next) {
  let post = await Post.find().populate("user")
  let postLikes = await Post.findById(req.params.pid).populate("like")

  res.render("userShowLikes", {
    post,
    postLikes: postLikes.like,
    user: req.user,
    uid: req.params.uid

  })
});
router.get('/postComment/:pid', isLoggedIn, async function (req, res, next) {
  let { pid } = req.params
  let post = await Post.find().populate("user")
  let postcomment = await Post.findById(pid).populate({
    path: "comment", populate: { path: "user" }
  })






  res.render("postComment", {
    post,
    pid,
    user: req.user,
    postcomment
  })
});
router.post('/postComment/:pid', isLoggedIn, async function (req, res, next) {
  let post = await Post.findById(req.params.pid)
  let newComment = await Comment.create({
    postComment: req.body.postComment,
    user: req.user._id,
    post: req.params.pid
  })
  await post.comment.push(newComment._id)
  await post.save()
  await newComment.save()

  res.redirect(`/postComment/${req.params.pid}`)
});

router.get('/userPostComment/:pid/:uid', isLoggedIn, async function (req, res, next) {
  let { pid } = req.params
  let post = await Post.find().populate("user")
  let postcomment = await Post.findById(pid).populate({
    path: "comment", populate: { path: "user" }
  })






  res.render("userPostComment", {
    post,
    pid,
    user: req.user,
    postcomment,
    uid: req.params.uid
  })
});

router.post('/userPostComment/:pid/:uid', isLoggedIn, async function (req, res, next) {
  let post = await Post.findById(req.params.pid)
  let newComment = await Comment.create({
    postComment: req.body.postComment,
    user: req.user._id,
    post: req.params.pid
  })
  await post.comment.push(newComment._id)
  await post.save()
  await newComment.save()

  res.redirect(`/userPostComment/${req.params.pid}/${req.params.uid}`)
});

router.get('/like/:pid', isLoggedIn, async function (req, res, next) {
  let post = await Post.findById(req.params.pid)
  if (post.like.includes(req.user._id)) {
    post.like = post.like.filter((uid) => {
      return (
        uid != req.user.id
      )
    })
  }
  else {
    post.like.push(req.user._id)
  }
  await post.save()
  res.redirect("/profile")
});
router.get('/userLike/:pid/:uid', isLoggedIn, async function (req, res, next) {
  let post = await Post.findById(req.params.pid)
  if (post.like.includes(req.user._id)) {
    post.like = post.like.filter((uid) => {
      return (
        uid != req.user.id
      )
    })
  }
  else {
    post.like.push(req.user._id)
  }
  await post.save()
  res.redirect(`/userProfile/${req.params.uid}`)
});
router.get('/update', isLoggedIn, function (req, res, next) {

  res.render("update", {
    user: req.user
  })
});
router.get('/timeline', isLoggedIn, async function (req, res, next) {
  res.render("timeline", {
    user: await req.user.populate("post")
  })
});
router.get('/deletePost/:pid', isLoggedIn, async function (req, res, next) {
  let deletePost = await Post.findById(req.params.pid)
  req.user.post=req.user.post.filter((elem)=>{
    return(
      elem != req.params.pid
    )
  })
  await req.user.save()
  deletePost.comment.forEach(async (elem) => {
    await Comment.findByIdAndDelete(elem)
  })
  let post = await Post.findByIdAndDelete(req.params.pid)
  fs.unlinkSync(path.join(global, post.postImage))





  res.redirect("/timeline")



});
router.get('/postUpdate/:pid', isLoggedIn, async function (req, res, next) {
  let post = await Post.findById(req.params.pid)
  res.render("postUpdate", {
    post,
    user: req.user
  })



});
router.post('/postUpdate/:pid', isLoggedIn, upload.single("postImage"), async function (req, res, next) {

  let post = await Post.findByIdAndUpdate(req.params.pid, req.body)
  if (req.file) {
    fs.unlinkSync(path.join(global, post.postImage))
    post.postImage = req.file.filename
  }
  await post.save()
  res.redirect("/timeline")

});
router.get('/deleteUser', isLoggedIn, async function (req, res, next) {
  let arrayCom = await Comment.findOneAndDelete({
    user: req.user._id
  })

  let post = await Post.find()
  console.log(arrayCom._id)

  post.forEach( (elem) => {

    if (elem.comment.includes(arrayCom._id)) {
       elem.comment = elem.comment.filter((cid) => {
        return(
          cid != arrayCom.id
        )
      })

    }
    if (elem.like.includes(req.user._id)) {
       elem.like = elem.like.filter((cid) => {
        return(
          cid != req.user.id
        )
      })

    }    
    elem.save()

  })
  
  let user = await User.findByIdAndDelete(req.user._id).populate("post")


  if (user.post) {
    user.post.forEach(async (elem) => {
      await elem.deleteOne()
      fs.unlinkSync(path.join(global, elem.postImage))
    })
  }

  if (user.profileImage != "default.jpg") {
    fs.unlinkSync(path.join(global, user.profileImage))
  }
  res.redirect("/login")

});
router.post('/update/:id', isLoggedIn, async function (req, res, next) {
  await User.findByIdAndUpdate(req.params.id, req.body)
  res.redirect("/profile")
});
router.get('/resetPassword', isLoggedIn, async function (req, res, next) {
  res.render("resetPassword", {
    user: req.user
  })
});
router.post('/resetPassword/:id', isLoggedIn, async function (req, res, next) {
  let user = await User.findById(req.params.id)
  await user.changePassword(
    req.body.oldPassword,
    req.body.newPassword
  )
  await user.save()
  res.redirect("/profile")
});
router.get('/forgetEmail', async function (req, res, next) {
  res.render("forgetEmail", {
    user: req.user
  })
});
router.post('/forgetEmail', async function (req, res, next) {
  let user = await User.findOne({ email: req.body.email })
  if (user) {
    res.redirect(`/forgetPassword/${user._id}`)
  }
  else {
    res.redirect("/forgetEmail")
  }
});
router.get('/forgetPassword/:id', async function (req, res, next) {
  res.render("forgetPassword", {
    id: req.params.id,
    user: req.user
  })
});
router.post('/forgetPassword/:id', async function (req, res, next) {
  let user = await User.findById(req.params.id)
  await user.setPassword(req.body.newPassword)
  await user.save()
  res.redirect("/login")
});
router.post('/profileImage', upload.single("profileImage"), isLoggedIn, async function (req, res, next) {
  try {
    if (req.user.profileImage !== "default.jpg") {
      fs.unlinkSync(path.join(global, req.user.profileImage))
    }
    req.user.profileImage = req.file.filename
    await req.user.save()
    res.redirect("/update")
  } catch (err) {
    console.log(err.message)
  }
});
router.post('/forgetPassword/:id', async function (req, res, next) {
  let user = await User.findById(req.params.id)
  await user.setPassword(req.body.newPassword)
  await user.save()
  res.redirect("/login")
});
router.get('/createPost', isLoggedIn, async function (req, res, next) {
  res.render("createPost", {
    user: req.user
  })
});
router.post('/createPost', upload.single("postImage"), isLoggedIn, async function (req, res, next) {
  let newPost = await Post.create({
    title: req.body.title,
    postImage: req.file.filename,
    user: req.user._id
  })
  await req.user.post.push(newPost)
  await req.user.save()
  await newPost.save()
  res.redirect("/profile")
});
router.get('/onlyPost/:pid', upload.single("postImage"), isLoggedIn, async function (req, res, next) {
  let post = await Post.findById(req.params.pid)
  let allPost = await Post.find()

  res.render("onlyPost", {
    post,
    user: req.user,
    allPost,
  })
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next()
  }
  else {
    res.redirect("/login")
  }
}

router.get('/logout', isLoggedIn, function (req, res, next) {
  req.logout(() => {
    res.redirect("/login")
  })
});

module.exports = router;
