const express = require("express");
const { createServer } = require("http");
var passport = require('passport')
  , OAuthStrategy = require('passport-oauth').OAuthStrategy;
var session = require('express-session')
const tumblr = require('tumblr.js');
const bodyParser = require('body-parser');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const CONSUMERKEY = process.env.CONSUMERKEY;
const CONSUMERSECRET = process.env.CONSUMERSECRET;

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || '3000';

app.use(bodyParser.urlencoded({ extended: true }));

passport.use('provider', new OAuthStrategy({
    requestTokenURL: 'https://www.tumblr.com/oauth/request_token',
    accessTokenURL: 'https://www.tumblr.com/oauth/access_token',
    userAuthorizationURL: 'https://www.tumblr.com/oauth/authorize',
    consumerKey: CONSUMERKEY,
    consumerSecret: CONSUMERSECRET,
    callbackURL: process.env.HOSTNAME + '/auth/provider/callback'
  },
  function(token, tokenSecret, profile, done) {
    done(null, {token: token, tokenSecret: tokenSecret})
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.set('view engine', 'ejs');

app.use(session({
    secret: "totallyasecret",
    saveUninitialized:true,
    resave: false 
}))

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/auth/provider', passport.authenticate('provider'));

app.get('/auth/provider/callback',
    passport.authenticate('provider', { successRedirect: '/blocklist', failureRedirect: '/failure' }));

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})

app.get('/blocklist',  async (req, res) => {
    if (!req.session || !req.session.passport || !req.session.passport.user) {
        res.redirect('/')
    }
    else{
        const client = tumblr.createClient({
            consumer_key: CONSUMERKEY,
            consumer_secret: CONSUMERSECRET,
            token: req.session.passport.user.token,
            token_secret: req.session.passport.user.tokenSecret,
        });
        const userInfo = await client.userInfo();
        // const userBlogs = userInfo['user']['blogs'];
        req.session.passport.user.name = userInfo['user']['name']
        blockList = []
        // for(const userBlog of userBlogs) {
        followers = await client.blogFollowers(userInfo['user']['name'])
        for(let i = 0; i < Math.min(100, followers['total_users']); i += 20) {
            followers = await client.blogFollowers(userInfo['user']['name'], {offset: i}) //userBlog['name']
            for (const follower of followers['users']){
                blog = await client.blogInfo(follower['name'])
                // Conditions
                block = false
                reasons = []
                // Blog is untitled, has no posts and never been updated
                if(blog['blog']['title'] == 'Untitled' && blog['blog']['posts'] == 0 && blog['blog']['updated'] == 0){
                    block = true
                    reasons.push('No title, No posts, Never updated')
                }
                if(block) {
                    blockList.push({name: follower['name'], reasons: reasons.join(', ')})
                }
            }
        }
        res.render('blocklist', {
            bots: blockList,
            botNames: blockList.map((bot) => {
                return bot.name;
            }).join(",")
        });
    }
})

app.get('/blockusers', async (req, res) => {
    console.log(req.query)
    const client = tumblr.createClient({
        consumer_key: CONSUMERKEY,
        consumer_secret: CONSUMERSECRET,
        token: req.session.passport.user.token,
        token_secret: req.session.passport.user.tokenSecret,
    });
    let apiPath = "/v2/blog/" + req.session.passport.user.name + "/blocks/bulk"
    console.log(apiPath, req.query.blockList)
    await client.postRequest(apiPath, {
        blocked_tumblelogs: req.query.blockList
    });
    res.send("Blocked bots")
})

app.get('/failure',  (req, res) => {
    res.render('index', {
        error: "Error unable to authenticate"
    })
})

