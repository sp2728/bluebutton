var express = require('express');
var router = express.Router();
const database = require("../models");
const User = database.User;

router.post('/authorize', async (req, res, next)=> {
  // if(!req.body.username){
  //   res.status(400);
  //   res.json({message:'Invalid request'});
  //   return;
  // }

  const user = await User.findOne({ where:{ username: req.body.username}});

  if(!user){
    try{
      await User.create({username: req.body.username, hasAuthorized: true});
      res.status(200);
      res.json({message:'User has authorized'});
    }
    catch(error){
      res.status(502);
      res.json({message:'Unable to authorize user'});
    }
  }
  else{
    res.status(409);
    res.json({message:'User has already authorized'});
  }
})

router.put('/unauthorize', async (req, res, next)=> {

  if(!req.body.username){
    res.status(400);
    res.json({message:'Invalid request'});
    return;
  }

  const user = await User.findOne({ where:{ username: req.body.username}});

  if(user){
      user.hasAuthorized = false;
      user.save();
      res.status(200);
      res.json({message:'User has been unauthorized'});
  }
  else{
    res.status(401);
    res.json({message:'User is already unauthorized'});
  }
})

module.exports = router;
