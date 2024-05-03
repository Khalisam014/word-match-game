/**
 * Name: Sama Khalid
 * This is the javascript file in charge of all of the
 * user interactivity. Like the selecting the cards, matching
 * up the cards, clicking start, etc.
 */
"use strict";
(function() {

  window.addEventListener("load", init);

  /**
   *
   */
  window.addEventListener("load", init);
  let totalMatches = 0;
  let selectedWords = [];
  const FOUR = 4;
  const ONE_SECOND = 1000;

  /**
   * This functio is in charge initiating the game. It also
   * populates the list of words in a grid format.
   */
  function init() {
    id("start-button").addEventListener("click", startGame);
    populateWordGrid();
  }

  /**
   * This function is in charge of making sure the user
   * selects four words, it hides the start button annd the intial
   * 4x4 grid.
   */
  function startGame() {
    if (selectedWords.length !== FOUR) {
      handleError("Please select exactly 4 words.");
    }
    id("word-selection-container").style.display = 'none';
    id("start-button").style.display = 'none';
    fetchDefinitions(selectedWords);
    startTimer();
  }

  /**
   * This function is in charge of populating the list of words
   * that will be displayed on a 4x4 grid. It appends each word
   * to the container.
   */
  function populateWordGrid() {
    const words = ["leasing", "brobdingnagian", "quixotic", "lugubrious", "Pulchritude",
                   "Maverick", "sardonic", "Facetious", "Bombastic", "Easy", "Computer",
                   "Unilateral", "Mango", "Rhythm", "Privilege", "Conscientious"];
    const container = id("word-selection-container");
    words.forEach(word => {
      let card = gen("div");
      card.textContent = word;
      card.className = "word-card";
      card.addEventListener("click", function() {
        toggleWordSelection(card);
      });
      container.appendChild(card);
    });
  }

  /**
   * This function is in charge of showing the cards are being
   * selected. If there are more than four words it wont let you
   * select it.
   * @param {*} card - the card that is being selected
   */
  function toggleWordSelection(card) {
    if (!card.classList.contains('selected') && selectedWords.length < FOUR) {
      selectedWords.push(card.textContent);
      card.classList.add('selected');
    } else if (card.classList.contains('selected')) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
      selectedWords = selectedWords.filter(word => word !== card.textContent);
      card.classList.remove('selected');
    }
  }

  /**
   *  This function is in charge of fetching the defintions
   *  of the 16 selected words.
   * @param {*} words - the words that are selected
   */
  function fetchDefinitions(words) {
    id("card-container").classList.remove("hidden");
    id("card-container").innerHTML = '';

    let fetches = words.map(word => {
      return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(statusCheck)
        .then(res => res.json())
        .then(data => {
          let definition = data[0].meanings[0].definitions[0].definition;
          displayWordAndDefinition(word, definition);
        })
        .catch(err => handleError(`Failed to fetch definition for ${word}: ${err}`));
    });

    // got from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
    Promise.all(fetches).then(() => {
      shuffleCards(id("card-container"));
    });
  }

  /**
   *  This function is in charge of displaying the word and
   *  definition in a grid form.
   * @param {*} word - the word selected by the user
   * @param {*} definition - the definition of the word
   */
  function displayWordAndDefinition(word, definition) {
    const container = id("card-container");
    let wordCard = gen("div");
    wordCard.textContent = word;
    wordCard.className = "word-card";

    // https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
    wordCard.dataset.definition = definition;
    wordCard.addEventListener("click", function() {
      attemptMatch(wordCard);
    });

    let definitionCard = gen("div");
    definitionCard.textContent = definition;
    definitionCard.className = "definition-card";
    definitionCard.dataset.definition = definition;
    definitionCard.addEventListener("click", function() {
      attemptMatch(definitionCard);
    });
    container.appendChild(wordCard);
    container.appendChild(definitionCard);
  }

  /**
   *  This function is in charge of checking if the
   *  two cards the user selects is a match. If it is a
   *  match then they will recieve a message saying that
   *  they are correct. If they get it wrong then a message is
   *  displayed saying that it is incorrect.
   * @param {*} card - the cards that are selected
   */
  function attemptMatch(card) {
    const container = id("card-container");
    const alrSelected = container.querySelector('.selected');
    if (alrSelected && alrSelected !== card) {
    // https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
      if (alrSelected.dataset.definition === card.dataset.definition) {
        alrSelected.classList.add('matched');
        card.classList.add('matched');
        alrSelected.classList.remove('selected');
        card.remove();
        alrSelected.remove();

        totalMatches++;
        if (totalMatches === FOUR) {
          gameOver(true);
        }
        displayFeedback('Correct match!', false);
      } else {
        alrSelected.classList.add('incorrect');
        card.classList.add('incorrect');

        setTimeout(() => {
          alrSelected.classList.remove('incorrect', 'selected');
          card.classList.remove('incorrect', 'selected');
          displayFeedback('Incorrect, try again!', true);
        }, ONE_SECOND);
      }
    } else {
      card.classList.add('selected');
    }
  }

  /**
   * This function is in charge of shuffling the cards so they
   * aren't next to each other making it more challenging.
   * @param {*} container - the grid that contains the cards and
   * defintions of the words.
   */
  function shuffleCards(container) {
    for (let i = container.children.length; i >= 0; i--) {
      container.appendChild(container.children[Math.random() * i | 0]);
    }
  }

  /**
   * Handles the errors displayed
   * @param {*} err - the message that is displayed when an error occurs
   */
  function handleError(err) {
    displayFeedback(err, true);
  }

  /**
   * This function is called after handleError
   * is called for the error to be more organized and
   * displayed correctly.
   * @param {*} message -  the message that is displayed when an error occurs
   * @param {*} isError - if it is an error or not
   */
  function displayFeedback(message, isError) {
    const feedback = id("feedback");
    feedback.textContent = message;
    if (isError) {
      feedback.classList.add("error");
    } else {
      feedback.classList.remove("error");
    }
  }

  /**
   * This function is in charge of decrementing
   * the timer and updating the display.
   */
  function startTimer() {
    let timeLeft = 30;
    const timerElement = id('time');
    const timerId = setInterval(() => {
      if (timeLeft <= 0 || totalMatches === FOUR) {
        clearInterval(timerId);
        gameOver(totalMatches === FOUR);
      } else {
        timeLeft -= 1;
        timerElement.textContent = timeLeft;
      }
    }, ONE_SECOND);
  }

  /**
   *  This function is in charge of taking care of the end of the
   *  game. When the user finsishes the game before the time is up
   *  they get an image of mario and if they don't finish in time then
   *  and image of bowser gets displayed with messages.
   * @param {*} success - if the cards were all matched before the time ran out
   */
  function gameOver(success) {
    id("card-container").style.display = 'none';
    const feedback = id("feedback");
    const artworkContainer = id("artwork-container");
    artworkContainer.style.display = 'block';

    if (success) {
      feedback.textContent = 'Congratulations! You matched all words correctly!';
      fetchAmiiboCharacter("Mario - Wedding");
    } else {
      feedback.textContent = 'Time up! Try again.';
      fetchAmiiboCharacter("bowser");
    }
  }

  /**
   * This function is in charge of fetching the amiibo character.
   * @param {*} characterName - either mario or bowser depending
   * if the user won or lost.
   */
  function fetchAmiiboCharacter(characterName) {
    const baseUrl = "https://www.amiiboapi.com/api/amiibo/";
    fetch(`${baseUrl}?name=${characterName}`)
      .then(statusCheck)
      .then(res => res.json())
      .then(data => displayAmiiboCharacter(data.amiibo[0].image))
      .catch(err => handleError("Failed to fetch character: " + err));
  }

  /**
   * This function is in charge of diplaying the amiibo character.
   * @param {*} imgUrl - the image url
   */
  function displayAmiiboCharacter(imgUrl) {
    const container = id("artwork-container");
    container.innerHTML = "";
    let img = gen("img");
    img.src = imgUrl;
    container.appendChild(img);
    container.classList.remove("hidden");
  }

  /**
   *  This function is a status check, testing edge cases
   *  and makes sure everything is functioning correctly.
   * @param {*} response -
   * @returns - returns response object
   */
  function statusCheck(response) {
    if (!response.ok) {
      throw Error("Error in request: " + response.statusText);
    }
    return response;
  }

  /**
   * Retrieves an element from the DOM by its id
   * @param {string} selector - the id of the DOM element
   * @returns {HTMLElement|null} DOM element associated with the ID or null
   */
  function id(selector) {
    return document.getElementById(selector);
  }

  /**
   * Creates a new DOM element with the specified tag name
   * @param {string} tagName - the tag name of the element created
   * @returns {HTMLElement} - created DOM element
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();