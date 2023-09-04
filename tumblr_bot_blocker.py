# Python script to test tumblr API
# Is not used in the web app

import pytumblr

# Authenticate via OAuth
client = pytumblr.TumblrRestClient(
  '',
  '',
  '',
  ''
)

# Make the request
info = client.info()
user_blogs = info['user']['blogs']
for user_blog in user_blogs:
    print("Searching blog:", user_blog['name'])
    followers = client.followers(user_blog['name'])
    block_list = []
    for follower in followers['users']:
        blog = client.blog_info(follower['name'])
        # Conditions
        block = False
        reasons = []
        # Blog is untitled
        if(blog['blog']['title'] == 'Untitled'):
            block = True
            reasons.append('No title')
        # Blog has no posts
        if(blog['blog']['posts'] == 0):
            block = True
            reasons.append('No posts')
        # Blog has never been updated 
        if(blog['blog']['updated'] == 0):
            block = True
            reasons.append('Never updated')
        if(block):
            print(follower['name'], 'Reasons:', ', '.join(reasons))
            block_list.append(follower['name'])
# confirm = input('Confirm that you want to block all users above (y/n):')
# if(confirm == 'y'):
#     for follower in block_list:
#         print("Blocking:", follower)
# else:
#     print("No one was blocked")
