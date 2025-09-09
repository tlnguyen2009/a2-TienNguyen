// FRONT-END (CLIENT) JAVASCRIPT HERE

// const submit = async function( event ) {
//   // stop form submission from trying to load
//   // a new .html page for displaying results...
//   // this was the original browser behavior and still
//   // remains to this day
//   event.preventDefault()
  
//   const input = document.querySelector( "#yourname" ),
//         json = { yourname: input.value },
//         body = JSON.stringify( json )

//   const response = await fetch( "/submit", {
//     method:"POST",
//     body 
//   })
//   //you can use .then(...) for these two down here
//   const text = await response.text()

//   console.log( "text:", text )
// }

window.onload = function() { //onload means when the page finish loading all HTML, it will run this function
  //Constant
  const COUNT_DOWN = 5;

  //Variables
  let score = 0;
  let timeLeft = COUNT_DOWN;
  let timerId = null;

  // Buttons for every game 
  const playButton = document.querySelector(".play-button");
  const pointButton = document.querySelector("#cockroach"); // click on cockroach image to get point
  const saveButton = document.querySelector(".save-button");
  const replayButton = document.querySelector(".replay-button");

  // pointButton.addEventListener("click", function(){
  //   console.log("point + 1");
  // })

  //cockroach images
  const COCKROACH_NORMAL_IMG = "../Assets/normal_coackroach.png";
  const COCKROACH_SQUASHED_IMG = "../Assets/squashed_cockroach.png";

  //Screen for each sections
  const firstSection = document.querySelector(".first-section");
  const gameSection = document.querySelector(".game-section");
  const lastSection = document.querySelector(".last-section");
  const rankingSection = document.querySelector(".ranking-section");

  //others
  const clockDisplay = document.querySelector(".clock");
  const scoreDisplay = document.querySelectorAll(".score");
  const nameInput = document.querySelector("#yourname");

  //---Buttons for navigation in nav-bar
  const backNav = document.querySelector(".nav-back");
  const rankingNav = document.querySelector(".nav-ranking");

  //---Display for navigation
  const scoreboardBody = document.querySelector("#scoreboard-body"); // id for the body of <table>, we just need to edit the body

  //show screen with "play" button
  const showPlayButtonScreen = function () {
    firstSection.style.display = 'flex';
    lastSection.style.display = 'none';
    gameSection.style.display = 'none';
    rankingSection.style.display = 'none';
  }

  //show ranking table screen
  const showRankingScreen = async function () {
    firstSection.style.display = 'none';
    lastSection.style.display = 'none';
    gameSection.style.display = 'none';
    rankingSection.style.display = 'flex';

    //then await to fetch data
    await fetchAndDisplayRanking(); 
  }

  //Main game function
  const startGame = function(){
    //reset score, time, gameActive every game
    score = 0;
    timeLeft = COUNT_DOWN; //seconds
    pointButton.src = COCKROACH_NORMAL_IMG;// Reset the cockroach image to the normal state at the start of every game.

    //update the displays on screen at that time
    scoreDisplay.forEach(scoreScreen => {
      scoreScreen.textContent = score;
    })
    clockDisplay.textContent = timeLeft;

    //only show game screen and hide the others
    firstSection.style.display = 'none';
    lastSection.style.display = 'none';
    gameSection.style.display = 'flex';
    rankingSection.style.display = 'none';

    // updateTimer function will be called automatically every 1000 milliseconds (1 second)
    // NOTICE: it will continue running until we stop manually, so don't forget to stop it when the game done
    timerId = setInterval(updateTimer, 1000);
  }

  //Update time function, this function will be called every one second
  const updateTimer = function() {
    timeLeft--;
    clockDisplay.textContent = timeLeft;

    //end game when it reaches 0
    if (timeLeft <= 0) {
      endGame();
    }
  }

  //increase score function
  const increaseScore = function() {
    score++;
    scoreDisplay.forEach(scoreScreen => {
      scoreScreen.textContent = score;
    })
  }

  //end game 
  const endGame = function () {
    //reset the "save" button from disable from last saving (Reading function submitScore() to be clearer)
    saveButton.disabled = false; // enable it 
    saveButton.textContent = "Save Score"; //change it back to save score
    nameInput.value = ''; //clear the last input 

    //show up the replay button in "last-section"
    firstSection.style.display = 'none';
    lastSection.style.display = 'flex';
    gameSection.style.display = 'none';
    rankingSection.style.display = 'none';

    //stop the timer interval
    clearInterval(timerId);
  }

  //when player wants to submit their score
  const submitScore = async function(event) {
    //stop the page reload when submitting the form
    event.preventDefault();

    //create a json
    const json = {
      yourname: nameInput.value,
      score: score,
    }

    const body = JSON.stringify(json) //stringify the json before sending through internet
    
    //disable buttons while fetching
    saveButton.disabled = true;
    replayButton.disabled = true;

    try {
      const reponse = await fetch("/submit", {
        method: "POST",
        body
      });
  
      //test how sever repond
      console.log("server response: ", reponse.text());
    } catch(err) {
      console.error("submit failed:", err);
    } finally {
      replayButton.disabled = false; //enable "replay" button
      saveButton.textContent = "DONE!" // change content of "Save Score" button to "DONE!"
    }
    
  }

  // fetch data from server and build table in html
  const fetchAndDisplayRanking = async function () {
    const response = await fetch("/ranking"); // GET by default
    const data = await response.json(); //convert string to json object

    scoreboardBody.innerHTML = ''; //clear old table and read for new one

    //loop through each data element from data array from backend
    data.forEach((thisPlayer, index) => {
      //create new row for each player
      const row = document.createElement('tr');
      //fill row element with <td>
      row.innerHTML = `
        <td>${index + 1}</td>
        <td class="player-name-cell"><span class="player-name">${thisPlayer.name}</span></td>
        <td>${thisPlayer.score}</td>
      `
      const cell = document.createElement('td');
      //create edit button
      const editButton = document.createElement('button');
      editButton.textContent = "Edit";
      editButton.className = "edit-button";
      editButton.onclick = () => {makeNameEditable(row, thisPlayer.name)}; // row is this row

      //create a delete button for each row of data table (each player)
      const deleteButton = document.createElement('button');
      deleteButton.textContent = "Delete"; //add text
      deleteButton.className = "delete-button"; //add class
      deleteButton.onclick = () => {deletePlayer(thisPlayer.name)};
      
      cell.appendChild(editButton);
      cell.appendChild(deleteButton);
      row.appendChild(cell);
      scoreboardBody.appendChild(row);
    });
  }

  // edit name then request to change
  const makeNameEditable = function (row, oldName) {
    alert("ONLY 'Name' allowed to edit. Hit 'ENTER' to save changes!"); //Send an alert to tell user how to save change

    const nameCell = row.querySelector('.player-name-cell');
    const nameSpan = row.querySelector('.player-name');

    const input = document.createElement('input');
    input.type = "text";
    input.value = oldName; //this will be new name later when user type in 
    input.className = "edit-input"; //for styling later

    //Listen to "Enter" key
    input.addEventListener('keydown', (event)=>{
      if(event.key === 'Enter') {
        event.preventDefault(); // Stop default form submission
        saveNewName(oldName, input.value); // function to process new and old name (save in BACK-END)
      }
    })

    nameSpan.replaceWith(input); //replace the <span> with the <input> (input) when it hears "click"
    input.focus(); //make the cursor focus inside the <input>
  }

  const saveNewName = async function (oldName, newName) {
    if(oldName === newName || !newName) { //if newName is the same as oldName and newName is blank
      fetchAndDisplayRanking(); //just reload the page, no need for "await" here because we don't load any data from backend
      return;
    }

    try {
      await fetch('/update', {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({oldName: oldName, newName: newName})
      });
    } catch (err) {
      console.error("somthing wrong with update input name", err);
    }

    await fetchAndDisplayRanking(); //refresh the table
  }

  // request to Delete a player to server
  const deletePlayer = async function (playerName) {
    //send request to "delete" a user to the server
    await fetch("/delete", { 
      method: 'POST',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify({name: playerName}), //stringify an object contaning "name" before send to the server
    })

    //Then, show up a new table to new after delete by calling this fetchAndDisplayRanking() again to load and show new table
    await fetchAndDisplayRanking(); 
  }

  //eventListener to control the whole screen flow of the game
  backNav.addEventListener('click', showPlayButtonScreen); //play a new game
  rankingNav.addEventListener('click', showRankingScreen);

  playButton.addEventListener('click', startGame); //start the game when player hit "play" button
  replayButton.addEventListener('click', startGame); // start the game again when the player hits replay button
  saveButton.addEventListener('click', submitScore); // submit the score 
  
  //cockroach image swap logic
  pointButton.addEventListener('mousedown', () => {
      pointButton.src = COCKROACH_SQUASHED_IMG;
  });

  pointButton.addEventListener('mouseup', () => {
    pointButton.src = COCKROACH_NORMAL_IMG;
  });

  pointButton.addEventListener('click', increaseScore); //increase score when player hit the button
}