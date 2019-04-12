const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticated} = require('../helpers/auth');
require('../helper');
router.get('/loginuser',(req,res)=>{
  res.render('users/loginuser');
})

router.get('/logintechnician',(req,res)=>{
  res.render('users/logintechnician');
})

router.get('/registeruser',(req,res)=>{
  res.render('users/registeruser');
})

router.get('/registertechnician',(req,res)=>{
  res.render('users/registertechnician');
})

router.post('/registeruser',(req,res)=>{
  const errors = [];
  if(req.body.password != req.body.password2){
    errors.push({text:"Passwords do not match!"})
  }
  if(req.body.password.length < 4){
    errors.push({text:"Password must be at least of 4 characters"})

  }

  if(errors.length > 0){
    res.render('users/registeruser',{
      errors: errors,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    })

  } else {
    db.query(`SELECT * FROM users WHERE email='${req.body.email}'`,(err,result)=>{
      if(result.length !== 0){
        req.flash('error_msg','Email already registered');
        res.redirect('/users/registeruser');
      } else {
        const newUser =  {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          address: req.body.address,
          city: req.body.city,
          pincode: req.body.pincode,
          contact : req.body.contact

        }
        bcrypt.genSalt(10,(err,salt)=>{
          bcrypt.hash(newUser.password,salt,(err,hash)=>{
            if(err) throw err;
            newUser.password = hash;
            db.query('INSERT INTO users SET?',newUser,(err,result)=>{
              if(err){throw err}
              console.log(result);
              req.flash('success_msg','You are now registered and can log in!');
              res.redirect('/users/loginuser');
            })
            
          })
        })
      }
    })
  }
})

// router.post('/registertechnician',(req,res)=>{
//   const errors = [];
//   if(req.body.password != req.body.password2){
//     errors.push({text:"Passwords do not match!"})
//   }
//   if(req.body.password.length < 4){
//     errors.push({text:"Password must be at least of 4 characters"})

//   }

//   if(errors.length > 0){
//     res.render('users/registertechnician',{
//       errors: errors,
//       username: req.body.username,
//       email: req.body.email,
//       password: req.body.password,
//       password2: req.body.password2
//     })

//   } else {
//     db.query(`SELECT * FROM technicians WHERE email='${req.body.email}'`,(err,result)=>{
//       if(result.length !== 0){
//         req.flash('error_msg','Email already registered');
//         res.redirect('/users/registertechnician');
//       } else {
//         const newUser =  {
//           username: req.body.username,
//           email: req.body.email,
//           password: req.body.password,
//           address: req.body.address,
//           city: req.body.city,
//           pincode: req.body.pincode,
//           contact : req.body.contact,
//           field: req.body.field

//         }
//         bcrypt.genSalt(10,(err,salt)=>{
//           bcrypt.hash(newUser.password,salt,(err,hash)=>{
//             if(err) throw err;
//             newUser.password = hash;
//             db.query('INSERT INTO technicians SET?',newUser,(err,result)=>{
//               if(err){throw err}
//               console.log(result);
//               req.flash('success_msg','You are now registered and can log in!');
//               res.redirect('/users/login');
//             })
            
//           })
//         })
//       }
//     })
//   }
// })

router.get('/home/:id',(req,res)=>{
  res.render('home/welcomeuser',{
    id:req.params.id
  });
})

router.post('/loginuser', (req,res, next)=>{
  let password = req.body.password;

  db.query(`SELECT * FROM users WHERE users.email='${req.body.email}'`,(err,user)=>{
    if(err){throw err;}
    console.log(user);
    
    if(user.length === 0){
      req.flash('success_msg','No use found');      res.redirect('/users/loginuser')
    } else {
    bcrypt.compare(password,user[0].password,(err,isMatch) => {
      if(err) throw err;
      if(isMatch){
        // res.redirect(`/users/home/${user[0].id}`)
        res.render('home/welcomeuser',{
          id: user[0].id,
          username: user[0].username
        })
      } else {
        req.flash('err_msg','Wrong password');
      }
    })
  }
})
  
  // passport.authenticate('local',{
  //   successRedirect: '/users/home',
  //   failureRedirect: '/users/loginuser',
  //   failureFlash: true
  // })(req,res, next);
});
router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success_msg','You are logged out');
  res.redirect('/');
})
router.post('/techselect/:id',(req,res)=>{
  
  db.query(`SELECT * FROM technicians WHERE field='${req.body.choice}'`,(err,user)=>{
    if(err){throw err;}
    
    
    // let x=JSON.stringify(user);
    // console.log(x);
    // console.log(typeof x);
    // x=JSON.parse(x);
    // console.log(x);

    
    
    res.render('home/welcomeuser',{
      user:user,

      id:req.params.id
    })
})
})
module.exports = router;