/**
 * Instagram Follow Checker Script
 * 
 * Run with --log flag to enable detailed logging:
 * instagramFollowChecker('--log');
 * 
 * Run without arguments for normal mode:
 * instagramFollowChecker();
 * 
 * To download results:
 * downloadResults();
 * 
 * To download logs (if logging was enabled):
 * downloadLogs();
 */

function instagramFollowChecker(flag) {
    const enableLogging = flag === '--log';
    
    (async function() {
        // Create a dedicated log function that saves all logs
        const logs = [];
        const log = (message, type = 'info') => {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            const logEntry = `[${timestamp}][${type}] ${message}`;
            logs.push(logEntry);
            
            // Only output to console if logging is enabled
            if (enableLogging) {
                if (type === 'error') {
                    console.error(logEntry);
                } else if (type === 'warn') {
                    console.warn(logEntry);
                } else {
                    console.log(logEntry);
                }
            }
        };
        
        // Function to download logs
        const downloadLogs = () => {
            if (logs.length === 0) {
                console.log('No logs available. Run the script with --log flag to enable logging.');
                return;
            }
            
            const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `instagram-script-logs-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        };
        
        // Add download logs function to window
        window.downloadLogs = downloadLogs;
        
        // Helper functions
        const delay = async (ms) => {
            log(`Waiting for ${ms}ms...`);
            await new Promise(resolve => setTimeout(resolve, ms));
            log(`Finished waiting for ${ms}ms`);
        };
        
        // Check if we're on Instagram
        if (!window.location.href.includes('instagram.com')) {
            console.error('Please run this script on Instagram website.');
            return;
        }
        
        if (enableLogging) {
            console.log('Instagram Follow Checker Starting with logging enabled...');
        } else {
            console.log('Instagram Follow Checker Starting...');
        }
        
        log('Script initialized');
        
        // Helper function to get username from profile URL
        const getUsernameFromUrl = (url) => {
            try {
                const parts = url.split('/');
                return parts[parts.length - 2] === '' ? parts[parts.length - 3] : parts[parts.length - 2];
            } catch (e) {
                log(`Error parsing URL: ${url}, Error: ${e.message}`, 'error');
                return url;
            }
        };
        
        // Function to find scrollable container with detailed logging
        const findScrollableContainer = () => {
            log('Searching for scrollable container...');
            
            // Direct approach - find the div with class _aano which is typically the scrollable container
            const directContainer = document.querySelector('div._aano');
            if (directContainer) {
                log('Found scrollable container with class _aano');
                return directContainer;
            }
            
            log('Did not find container with class _aano, searching for alternatives...');
            
            // Log all elements in the dialog for debugging
            const dialog = document.querySelector('div[role="dialog"]');
            if (!dialog) {
                log('No dialog found!', 'error');
                return null;
            }
            
            log(`Dialog found: ${dialog.className}`);
            
            // Log all divs in the dialog with their properties
            const divs = dialog.querySelectorAll('div');
            log(`Found ${divs.length} divs in dialog`);
            
            let scrollableCandidate = null;
            let maxHeight = 0;
            
            divs.forEach((div, index) => {
                const style = window.getComputedStyle(div);
                const hasScroll = style.overflowY === 'auto' || style.overflowY === 'scroll';
                const height = div.clientHeight;
                
                if (hasScroll && div.scrollHeight > div.clientHeight) {
                    log(`Potential scrollable div #${index}: class=${div.className}, height=${height}, scrollHeight=${div.scrollHeight}`);
                    
                    if (height > maxHeight) {
                        maxHeight = height;
                        scrollableCandidate = div;
                    }
                }
            });
            
            if (scrollableCandidate) {
                log(`Selected scrollable container: class=${scrollableCandidate.className}, height=${scrollableCandidate.clientHeight}`);
                return scrollableCandidate;
            }
            
            // If no scrollable div found, get the largest div in the dialog as a fallback
            let largestDiv = null;
            maxHeight = 0;
            
            divs.forEach((div, index) => {
                const height = div.clientHeight;
                if (height > maxHeight) {
                    maxHeight = height;
                    largestDiv = div;
                }
            });
            
            if (largestDiv) {
                log(`No scrollable container found. Using largest div as fallback: class=${largestDiv.className}, height=${largestDiv.clientHeight}`, 'warn');
                return largestDiv;
            }
            
            log('No suitable scrollable container found', 'error');
            return null;
        };
        
        // Improved scrolling function with detailed logging
        const scrollDialog = async (maxScrollAttempts = 300) => {
            log('Starting scrollDialog function...');
            
            const scrollableSection = findScrollableContainer();
            if (!scrollableSection) {
                log('Failed to find scrollable container', 'error');
                return false;
            }
            
            log(`Found scrollable section: class=${scrollableSection.className}, height=${scrollableSection.clientHeight}, scrollHeight=${scrollableSection.scrollHeight}`);
            
            let lastHeight = scrollableSection.scrollHeight;
            let scrollCount = 0;
            let noChangeCount = 0;
            
            log(`Initial scroll height: ${lastHeight}`);
            
            while (scrollCount < maxScrollAttempts) {
                scrollCount++;
                
                log(`Scroll attempt ${scrollCount}/${maxScrollAttempts}`);
                
                // Scroll down
                scrollableSection.scrollTop = scrollableSection.scrollHeight;
                log(`Scrolled to position: ${scrollableSection.scrollTop}`);
                
                await delay(800 + Math.random() * 400);
                
                // Check if we've reached the bottom
                const newHeight = scrollableSection.scrollHeight;
                log(`New scroll height: ${newHeight}, previous: ${lastHeight}`);
                
                if (newHeight === lastHeight) {
                    noChangeCount++;
                    log(`No change in height detected (${noChangeCount}/5)`);
                    if (noChangeCount >= 5) {
                        log('Finished scrolling, no changes detected after 5 attempts');
                        break;
                    }
                } else {
                    noChangeCount = 0;
                    lastHeight = newHeight;
                    log(`Height changed, reset no-change counter`);
                }
                
                if (scrollCount >= maxScrollAttempts) {
                    log('Reached maximum scroll attempts', 'warn');
                }
                
                // Add progress indicator every 20 scrolls if logging is disabled
                if (!enableLogging && scrollCount % 20 === 0) {
                    console.log(`Scrolling... (${scrollCount}/${maxScrollAttempts})`);
                }
            }
            
            log(`Scrolling completed. Final height: ${scrollableSection.scrollHeight}`);
            return true;
        };
        
        // Function to get all usernames from current dialog with detailed logging
        const getUsernamesFromDialog = () => {
            log('Getting usernames from dialog...');
            
            const dialog = document.querySelector('div[role="dialog"]');
            if (!dialog) {
                log('No dialog found for username extraction', 'error');
                return [];
            }
            
            log('Found dialog for username extraction');
            
            // Try to get the links containing usernames
            const userLinks = dialog.querySelectorAll('a[role="link"]');
            log(`Found ${userLinks.length} user links in dialog`);
            
            const usernames = [];
            
            userLinks.forEach((link, index) => {
                if (link.href && link.href.includes('/') && 
                    !link.href.includes('/p/') && 
                    !link.href.includes('/reels/') && 
                    !link.href.includes('/stories/') &&
                    !link.href.includes('/explore/')) {
                    
                    const username = getUsernameFromUrl(link.href);
                    log(`Processing link #${index}: href=${link.href}, extracted username=${username}`);
                    
                    if (username && !usernames.includes(username) && username !== 'accounts') {
                        usernames.push(username);
                        log(`Added username: ${username}`);
                    }
                }
            });
            
            log(`Total unique usernames found: ${usernames.length}`);
            return usernames;
        };
        
        // Function to click on followers/following links with detailed logging
        const clickLink = async (type) => {
            log(`Attempting to click ${type} link...`);
            
            const selectors = type === 'followers' ? 
                ['a[href$="/followers/"]', 'a[href*="/followers"]', 'ul li:nth-child(2) a'] : 
                ['a[href$="/following/"]', 'a[href*="/following"]', 'ul li:nth-child(3) a'];
            
            for (const selector of selectors) {
                log(`Trying selector: ${selector}`);
                const element = document.querySelector(selector);
                
                if (element) {
                    log(`Found ${type} link with selector: ${selector}`);
                    log(`Link text: ${element.textContent}`);
                    
                    try {
                        log(`Clicking on ${type} link...`);
                        element.click();
                        log(`Successfully clicked ${type} link`);
                        return true;
                    } catch (err) {
                        log(`Error clicking ${type} link: ${err.message}`, 'error');
                    }
                } else {
                    log(`No element found with selector: ${selector}`);
                }
            }
            
            if (enableLogging) {
                console.error(`Could not find or click ${type} link`);
            }
            log(`Could not find or click ${type} link`, 'error');
            return false;
        };
        
        // Function to close dialog with detailed logging
        const closeDialog = async () => {
            log('Attempting to close dialog...');
            
            const closeSelectors = [
                'div[role="dialog"] button[type="button"]',
                'div[role="dialog"] svg[aria-label="Close"]',
                'div[role="presentation"] button',
                'div[role="dialog"] button'
            ];
            
            for (const selector of closeSelectors) {
                log(`Trying close button selector: ${selector}`);
                const closeButton = document.querySelector(selector);
                
                if (closeButton) {
                    log(`Found close button with selector: ${selector}`);
                    try {
                        closeButton.click();
                        log('Successfully clicked close button');
                        await delay(1500);
                        return true;
                    } catch (err) {
                        log(`Error clicking close button: ${err.message}`, 'error');
                    }
                } else {
                    log(`No close button found with selector: ${selector}`);
                }
            }
            
            log('No close button found, trying Escape key...');
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: true
            }));
            
            log('Sent Escape key event');
            await delay(1500);
            return true;
        };
        
        // Function to get followers with detailed logging
        const getFollowers = async () => {
            log('Starting getFollowers function...');
            console.log('Getting followers...');
            
            const clicked = await clickLink('followers');
            if (!clicked) {
                log('Failed to click followers link', 'error');
                return [];
            }
            
            log('Waiting for followers dialog to open...');
            await delay(3000);
            
            log('Scrolling through followers list...');
            await scrollDialog();
            
            log('Getting follower usernames...');
            const followers = getUsernamesFromDialog();
            log(`Found ${followers.length} followers`);
            console.log(`Found ${followers.length} followers`);
            
            log('Closing followers dialog...');
            await closeDialog();
            
            return followers;
        };
        
        // Function to get following with detailed logging
        const getFollowing = async () => {
            log('Starting getFollowing function...');
            console.log('Getting following...');
            
            const clicked = await clickLink('following');
            if (!clicked) {
                log('Failed to click following link', 'error');
                return [];
            }
            
            log('Waiting for following dialog to open...');
            await delay(3000);
            
            log('Scrolling through following list...');
            await scrollDialog();
            
            log('Getting following usernames...');
            const following = getUsernamesFromDialog();
            log(`Found ${following.length} following`);
            console.log(`Found ${following.length} following`);
            
            log('Closing following dialog...');
            await closeDialog();
            
            return following;
        };
        
        // Main function
        try {
            log('Starting main function...');
            
            log('Getting followers...');
            const followers = await getFollowers();
            log(`Followers retrieval complete. Found ${followers.length} followers`);
            
            await delay(2000);
            
            log('Getting following...');
            const following = await getFollowing();
            log(`Following retrieval complete. Found ${following.length} following`);
            
            if (followers.length === 0 && following.length === 0) {
                log('Could not retrieve any followers or following', 'error');
                console.error('Could not retrieve any followers or following');
                return;
            }
            
            // Find users who don't follow you back
            const notFollowingBack = following.filter(user => !followers.includes(user));
            log(`Found ${notFollowingBack.length} users who don't follow you back`);
            
            // Find users you don't follow back
            const notFollowedBack = followers.filter(user => !following.includes(user));
            log(`Found ${notFollowedBack.length} users you don't follow back`);
            
            // Display results with styling
            console.log('%c=== Instagram Follow Checker Results ===', 'font-size: 16px; font-weight: bold; color: #405DE6;');
            
            console.log(`Total followers found: ${followers.length}`);
            console.log(`Total following found: ${following.length}`);
            
            console.log('%cUsers who DON\'T follow you back:', 'font-size: 14px; font-weight: bold; color: #C13584;');
            console.table(notFollowingBack.map(user => ({ username: user })));
            console.log(`Total: ${notFollowingBack.length} users don't follow you back`);
            
            console.log('%cUsers you DON\'T follow back:', 'font-size: 14px; font-weight: bold; color: #5851DB;');
            console.table(notFollowedBack.map(user => ({ username: user })));
            console.log(`Total: ${notFollowedBack.length} users you don't follow back`);
            
            // Create downloadable results
            const createDownloadableResults = () => {
                const today = new Date().toISOString().split('T')[0];
                let content = `Instagram Follow Checker Results - ${today}\n\n`;
                
                content += `Total followers found: ${followers.length}\n`;
                content += `Total following found: ${following.length}\n\n`;
                
                content += `=== Users who DON'T follow you back (${notFollowingBack.length}) ===\n`;
                notFollowingBack.forEach(user => {
                    content += `@${user}\n`;
                });
                
                content += `\n=== Users you DON'T follow back (${notFollowedBack.length}) ===\n`;
                notFollowedBack.forEach(user => {
                    content += `@${user}\n`;
                });
                
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `instagram-follow-checker-${today}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            };
            
            console.log('%cWant to download these results?', 'font-size: 14px; color: #833AB4;');
            console.log('Run this command: downloadResults()');
            
            // Add download functions to window
            window.downloadResults = createDownloadableResults;
            
            // Final log
            log('Script execution completed successfully');
            if (enableLogging) {
                console.log('Script execution completed successfully');
                console.log('To download logs, run: downloadLogs()');
            }
            
        } catch (error) {
            log(`An error occurred: ${error.message}`, 'error');
            log(`Stack trace: ${error.stack}`, 'error');
            console.error(`An error occurred: ${error.message}`);
            console.log('Please make sure you\'re on your profile page and try again.');
            if (enableLogging) {
                console.log('To download logs for troubleshooting, run: downloadLogs()');
            }
        }
    })();
}

// Add to window for easy access
window.instagramFollowChecker = instagramFollowChecker;

// Log instructions
console.log('Instagram Follow Checker loaded!');
console.log('To run with normal mode: instagramFollowChecker()');
console.log('To run with logging enabled: instagramFollowChecker(\'--log\')');
