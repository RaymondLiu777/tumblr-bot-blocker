# Tumblr Bot Blocker
This is a small website I set up to scan tumblr followers for bots and let you remove them.

# Features
- Connects to your tumblr account through oauth1
- Scans the followers on your main blog
- Identifies followers that have an untitled blog and no posts
- Let you decide which ones to block

# Limitations
THIS WAS MADE BY A CS STUDENT IN A DAY. There are many problems and security concerns with it. Be careful how you use it, because others could take control over your tumblr account 
- Only scans main blog for account
- Only blocks on main blog for account
- Bot detection is VERY primitive
- Only scans first 100 followers
- Regenerates an oauth token every time and these tokens last forever unless revoked manually
- Ignores api limits of tumblr

# Setup
1. Install nodejs and npm
2. Clone this repository
3. Create a tumblr API key here: https://www.tumblr.com/oauth/register
4. Add the consumer key and consumer secret to a .env file
5. Set the hostname in the .env file
6. run `npm install`
7. run `npm start`

# Production - With Heroku
1. Create a new heroku application
2. Set environmental variables for the application (consumer key, consumer secret, hostname)
3. Push this code to the heroku application with their instructions on deploying a node js application
4. Deploy on keroku
