let countdown;

// Get references to the buttons and the slider
let startButton = document.getElementById('startButton');
let pauseButton = document.getElementById('pauseButton');
let resumeButton = document.getElementById('resumeButton');
let resetButton = document.getElementById('resetButton');
let restartButton = document.getElementById('restartButton');
let focusTimeSlider = document.getElementById('focusTimeSlider');


function loadButtonStates() {
  // Load the saved states from chrome.storage when the popup is opened
    chrome.storage.sync.get(['startButton', 'pauseButton', 'resumeButton', 'resetButton', 'restartButton', 'focusTimeSlider'], function(result) {
      console.log('Loaded button states:', result); // Debugging line
      startButton.style.display = result.startButton || 'block';
      pauseButton.style.display = result.pauseButton || 'none';
      resumeButton.style.display = result.resumeButton || 'none';
      resetButton.style.display = result.resetButton || 'none';
      restartButton.style.display = result.restartButton || 'none';
      focusTimeSlider.style.display = result.focusTimeSlider || 'block';
    });
  }
  // Call the function immediately to load the button states when the popup opens
  loadButtonStates();

// Get the current day
let today = new Date().getDay();

// Load the saved day from chrome.storage
chrome.storage.sync.get(['savedDay'], function(result) {
  // If the saved day is not today, reset the counters
  console.log('Loaded saved day:', result); // Debugging line
  if (result.savedDay !== today) {
    // Reset the counters
    focusTime.value = 30;
    focusTimeValue.textContent = 0;

    // Update the saved day in chrome.storage
    chrome.storage.sync.set({savedDay: today});
  }
});


// focus slider
let focusTime = document.getElementById('focusTime');
let focusTimeValue = document.getElementById('focusTimeValue');

focusTime.oninput = function() {
  console.log('Focus time input changed:', this.value); // Debugging line
  focusTimeValue.textContent = this.value;
}


// Initially, only the start button should be visible
pauseButton.style.display = 'none';
resumeButton.style.display = 'none';
resetButton.style.display = 'none';
restartButton.style.display = 'none';

// Buttion event listeners
///
document.getElementById('startButton').addEventListener('click', function() {
    var minutes = parseFloat(document.getElementById('focusTime').value);
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('resetButton').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'block';
    document.getElementById('resumeButton').style.display = 'none';
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('focusTimeSlider').style.display = 'none';
    // Save the new states to chrome.storage
    chrome.storage.sync.set({startButton: 'none', pauseButton: 'block', resumeButton: 'none', resetButton: 'none', restartButton: 'none', focusTimeSlider: 'none'});
    if (!isNaN(minutes)) {
      chrome.runtime.sendMessage({minutes: minutes});
    }
  });

  document.getElementById('pauseButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({pause: true});
    document.getElementById('pauseButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('resetButton').style.display = 'block';
    document.getElementById('resumeButton').style.display = 'block';
    document.getElementById('restartButton').style.display = 'none';
    // Save the new states to chrome.storage
    chrome.storage.sync.set({startButton: 'none', pauseButton: 'none', resumeButton: 'block', resetButton: 'block', restartButton: 'none', focusTimeSlider: 'none'});
  });

  document.getElementById('resetButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({reset: true});
    document.getElementById('resetButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'block';
    document.getElementById('resumeButton').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'none';
    document.getElementById('focusTimeSlider').style.display = 'block';
    // Save the new states to chrome.storage
    chrome.storage.sync.set({startButton: 'block', pauseButton: 'none', resumeButton: 'none', resetButton: 'none', focusTimeSlider: 'block', restartButton: 'block'});
  });


  document.getElementById('resumeButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({resume: true});
    document.getElementById('resumeButton').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'block';
    document.getElementById('resetButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('restartButton').style.display = 'none';
    // Save the new states to chrome.storage
    chrome.storage.sync.set({startButton: 'none', pauseButton: 'block', resumeButton: 'none', resetButton: 'none', focusTimeSlider: 'none', restartButton: 'none'});
  });

  document.getElementById('restartButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({restart: true});
    document.getElementById('resumeButton').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'none';
    document.getElementById('resetButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'block';
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('focusTimeSlider').style.display = 'block';
    // Save the new states to chrome.storage
    chrome.storage.sync.set({startButton: 'block', pauseButton: 'none', resumeButton: 'none', resetButton: 'none', focusTimeSlider: 'block', restartButton: 'none'});
  });


  function updateCountdown() {
    chrome.runtime.sendMessage({request: 'remainingTime'}, function(response) {
    let remainingTime = response.remainingTime;
      //const remainingTime = response.remainingTime;
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;

      document.getElementById('countdown').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        // Log the countdown value
       // console.log('Countdown:', countdown);
    });
  }
  
  function updateCount() {
    chrome.storage.local.get('count', function(data) {
//      document.getElementById('count').textContent = `Count: ${data.count || 0}`;
    });
  }
  
  chrome.storage.local.get('sessions', function(data) {
    let sessions = data.sessions || [];
    let sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = ''; // Clear the list

    // Group sessions by day
    let sessionsByDay = {};
    for (let i = 0; i < sessions.length; i++) {
        let session = sessions[i];
        let day = new Date(session.start).toLocaleDateString();
        if (!sessionsByDay[day]) {
            sessionsByDay[day] = [];
        }
        sessionsByDay[day].push(session);
    }

    // Sort the days
    let sortedDays = Object.keys(sessionsByDay).sort();



    
    // Display the sessions
    for (let i = 0; i < sortedDays.length; i++) {
        let day = sortedDays[i];
        let daySessions = sessionsByDay[day];
        for (let j = 0; j < daySessions.length; j++) {
            let session = daySessions[j];
            let listItem = document.createElement('div');
            let startTime = new Date(session.start).toLocaleTimeString();
            let endTime = session.end ? new Date(session.end).toLocaleTimeString() : 'incomplete';
            let duration = session.duration / 1000 / 60; // Convert duration from ms to minutes
            duration = duration.toFixed(2); // "123.46"
          //  listItem.textContent = `Day: ${day}, Session ${j + 1}: Start time: ${startTime}, End time: ${endTime}, Duration: ${duration} minutes`;
          
          //  listItem.textContent = `Day: ${day}, Session ${j + 1}: Start time: ${startTime}, End time: ${endTime}, Duration: ${duration} minutes`;

listItem.innerHTML = `<li>
<div><b>SESSION ${j + 1} :</b> STARTED ${startTime} - ${endTime}, [ Duration ${duration} minutes]</div></li>`;
sessionList.appendChild(listItem);
        }
    }
});


// Listen for commnds from background.js this 
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == "restartButton") {
      let resetButton = document.querySelector('#restartButton');
      resetButton.style.display = 'block';
      restartButton.style.display = 'block';
      pauseButton.style.display = 'none';
      // Save the new states to chrome.storage
      chrome.storage.sync.set({startButton: 'none', pauseButton: 'none', resumeButton: 'none', resetButton: 'none', focusTimeSlider: 'none', restartButton: 'block'});
    }
  });


// Listen for changes in the storage area ans reset 
chrome.storage.onChanged.addListener(function(changes, namespace) {
  console.log(changes);
    // Log the changes to the console

  // Check if the countdown has changed
  if (changes.countdown) {
    console.log('Countdown:', changes.countdown.newValue);
    // Check if the countdown is zero
    if (changes.countdown.newValue == 0) {

      startButton.style.display = 'block';
      pauseButton.style.display = 'block';
      resumeButton.style.display = 'block';
      resetButton.style.display = 'none';
      focusTimeSlider.style.display = 'block';
      
      // Save the new states to chrome.storage
      chrome.storage.sync.set({startButton: 'block', pauseButton: 'block', resumeButton: 'block', resetButton: 'block', focusTimeSlider: 'block', restartButton: 'block' });
    }
  }
});

// this is a way to send messages to the background.js file
console.log = function(message) {
  chrome.runtime.sendMessage({type: "console", message: message});
};


  setInterval(updateCountdown, 1000);
  setInterval(updateCount, 1000);

//window.addEventListener('unload', function() {
 // clearInterval(countdown);
///});