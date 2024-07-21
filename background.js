let countdown;
let endTime;
let remainingTime = 0;
let sessions = []; // Define the sessions array
let breaks = []; // Define the breaks array
let focusTimes = []; // Define the focus times array


/// this pulls the data from the storage and sets it to the variables
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "console") {
      console.log(request.message);
    }
 });

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.minutes) {
        chrome.action.setBadgeBackgroundColor({color: '#4688F1'});
        chrome.action.setBadgeTextColor({color: '#FFFFFF'});
        remainingTime = message.minutes * 60;
        console.log('Starting countdown with minutes:', message.minutes); // Debugging line
        startCountdown(message.minutes); // Pass the minutes parameter
        focusTimes.push(message.minutes); // Add the focus time to the array
        chrome.storage.local.set({focusTimes: focusTimes}); // Save the focus times array to storage
    } else if (message.pause) {
        if (remainingTime > 0) {
            console.log('Pausing countdown'); // Debugging line
            clearInterval(countdown);
        } 
       // clearInterval(countdown);
    } else if (message.resume) {
        if (remainingTime > 0) {
            console.log('Resuming countdown with remaining time:', remainingTime / 60); // Debugging line
            startCountdown(remainingTime / 60); // Pass the remaining time in minutes
        } 
     // startCountdown(message.minutes); // Pass the minutes parameter
    } else if (message.reset) {
        console.log('Resetting countdown'); // Debugging line
        clearInterval(countdown);
        chrome.action.setBadgeText({text: ''});
        remainingTime = 0;
    } else if (message.break) {
        breaks.push(message.minutes); // Add the break time to the array
        chrome.storage.local.set({breaks: breaks}); // Save the breaks array to storage
    } else if (message.request === 'remainingTime') {
        sendResponse({remainingTime: remainingTime});
    }
    
});


function startCountdown(minutes) {
    if (remainingTime <= 0) {
        return;
    }
    endTime = Date.now() + remainingTime * 1000;
    // Add the new session to the sessions array
    sessions.push({start: Date.now(), duration: minutes * 60 * 1000});
    // Save the sessions array to storage
    chrome.storage.local.set({sessions: sessions});
    countdown = setInterval(function() {
        remainingTime = Math.round((endTime - Date.now()) / 1000);
        console.log('Remaining time:', remainingTime); // Debugging line
        if (remainingTime <= 0) {
            console.log('Countdown finished'); // Debugging line
            clearInterval(countdown);
      
            chrome.action.setBadgeText({text: '0:00'});
            chrome.action.setBadgeBackgroundColor({color: '#fb3b1e'});
            chrome.action.setBadgeTextColor({color: '#FFFFFF'});

            try {
                chrome.runtime.sendMessage({command: "restartButton"});
            } catch (error) {
    
                error = null;
            }
           //  chrome.runtime.sendMessage({command: "restartButton"});      
       
            // Save the new states to chrome.storage
            chrome.storage.sync.set({startButton: 'none', pauseButton: 'none', resumeButton: 'none', resetButton: 'none', focusTimeSlider: 'none', restartButton: 'block'});
            
            // Update the end time and completed status of the last session
            sessions[sessions.length - 1].end = Date.now();
            sessions[sessions.length - 1].completed = true;
            // Save the updated sessions array to storage
            chrome.storage.local.set({sessions: sessions});
            return
        } else {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        chrome.action.setBadgeText({text: `${minutes}${seconds < 10 ? '0' : ''}${seconds}`});
        }
    }, 1000);
}