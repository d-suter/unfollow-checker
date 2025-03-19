# Instagram Follow Checker  

A simple script to check who isn't following you back on Instagram.  

## What it does  

This script analyzes your Instagram followers and following lists to show:  
- People who don't follow you back  
- People you don't follow back  

## How to use  

1. Go to your Instagram profile in a web browser  
2. Open Developer Tools (F12 or right-click → Inspect)  
3. Go to the Console tab  
4. Paste and run the following command:  

   ```javascript
   import('https://raw.githubusercontent.com/d-suter/unfollow-checker/refs/heads/main/script.js')
     .then(() => instagramFollowChecker());
   ```  

5. Wait for the script to finish—it will scroll through your followers and following lists  
6. Results will appear in the console  

## Options  

- For normal mode:  

  ```javascript
  import('https://raw.githubusercontent.com/d-suter/unfollow-checker/refs/heads/main/script.js')
    .then(() => instagramFollowChecker());
  ```  

- For detailed logging:  

  ```javascript
  import('https://raw.githubusercontent.com/d-suter/unfollow-checker/refs/heads/main/script.js')
    .then(() => instagramFollowChecker('--log'));
  ```  
