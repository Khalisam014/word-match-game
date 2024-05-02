/**
 *
 */

"use strict";
(function() {

  window.addEventListener("load", init);

  /**
   *
   */
  window.addEventListener("load", init);
  let totalMatches = 0;
  let gameEnded = false;
  let selectedWords = [];

  /**
   *
   */
  function init() {
    id("startGameButton").addEventListener("click", startGame);
    populateWordGrid();
  }

  /**
   *
   * @returns
   */
  function startGame() {
    if (selectedWords.length !== 4) {
      displayError("Please select exactly 4 words.");
      return;
    }
    id("wordSelectionContainer").style.display = 'none';
    id("startGameButton").style.display = 'none';
    fetchDefinitions(selectedWords);
    startTimer();
  }

  /**
   *
   */
  function populateWordGrid() {
    const words = ["leasing", "brobdingnagian", "quixotic", "lugubrious", "Pulchritude",
                   "Maverick","sardonic", "Facetious", "Bombastic", "Easy", "Computer",
                   "Unilateral", "Mango", "Rhythm", "Privilege", "Conscientious"];
    const container = id("wordSelectionContainer");
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
   *
   * @param {*} card
   */
  function toggleWordSelection(card) {
    if (!card.classList.contains('selected') && selectedWords.length < 4) {
      selectedWords.push(card.textContent);
      card.classList.add('selected');
    } else if (card.classList.contains('selected')) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
      selectedWords = selectedWords.filter(word => word !== card.textContent);
      card.classList.remove('selected');
    }
  }

  /**
   *
   * @param {*} words
   */
  function fetchDefinitions(words) {
    id("cardContainer").classList.remove("hidden");
    id("cardContainer").innerHTML = '';

    let fetches = words.map(word => {
      return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(statusCheck)
        .then(res => res.json())
        .then(data => {
          let definition = data[0].meanings[0].definitions[0].definition;
          displayWordAndDefinition(word, definition);
        })
        .catch(err => displayError(`Failed to fetch definition for ${word}: ${err}`));
    });

    // got from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
    Promise.all(fetches).then(() => {
      shuffleCards(id("cardContainer"));
    });
  }


  /**
   *
   * @param {*} word
   * @param {*} definition
   */
  function displayWordAndDefinition(word, definition) {
    const container = id("cardContainer");
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
    // https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
    definitionCard.dataset.definition = definition;
    definitionCard.addEventListener("click", function() {
      attemptMatch(definitionCard);
    });

    container.appendChild(wordCard);
    container.appendChild(definitionCard);
  }

  /**
   *
   * @param {*} card
   */
  function attemptMatch(card) {
    const container = id("cardContainer");
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
        if (totalMatches === 4) {  ///maybe make a function for it (checkIfFour)
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
        }, 1000);
      }
    } else {
      card.classList.add('selected');
    }
  }

  /**
   *
   * @param {*} container
   */
  function shuffleCards(container) {
    for (let i = container.children.length; i >= 0; i--) {
      container.appendChild(container.children[Math.random() * i | 0]);
    }
  }

  /**
   *
   * @param {*} message
   */
  function displayError(message) {
    displayFeedback(message, true);
  }

  /**
   *
   * @param {*} message
   * @param {*} isError
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
   *
   */
  function startTimer() {
    let timeLeft = 30;
    const timerElement = id('time');
    const timerId = setInterval(() => {
      if (timeLeft <= 0 || totalMatches === 4) {
        clearInterval(timerId);
        gameOver(totalMatches === 4);
      } else {
        timeLeft -= 1;
        timerElement.textContent = timeLeft;
      }
    }, 1000);
  }

  /**
   *
   * @param {*} success
   */
  function gameOver(success) {
    gameEnded = true;
    id("cardContainer").style.display = 'none';
    const feedback = id("feedback");
    const artworkContainer = id("artworkContainer");
    artworkContainer.style.display = 'block';

    if (success) {
      feedback.textContent = 'Congratulations! You matched all words correctly!';
      fetchAmiiboCharacter("mario");
    } else {
      feedback.textContent = 'Time up! Try again.';
      fetchAmiiboCharacter("bowser");
    }
  }

  /**
   *
   * @param {*} characterName
   */
  function fetchAmiiboCharacter(characterName) {
    const baseUrl = "https://www.amiiboapi.com/api/amiibo/";
    fetch(`${baseUrl}?name=${characterName}`)
      .then(statusCheck)
      .then(res => res.json())
      .then(data => displayAmiiboCharacter(data.amiibo[0].image))
      .catch(err => displayError("Failed to fetch character: " + err));
  }

  /**
   *
   * @param {*} imgUrl
   */
  function displayAmiiboCharacter(imgUrl) {
    const container = id("artworkContainer");
    container.innerHTML = "";
    let img = gen("img");
    img.src = imgUrl;
    container.appendChild(img);
    container.classList.remove("hidden");
  }

   /**
   *
   * @param {*} response
   * @returns
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
   * Retrieves the first element from the DOM that matches
   * the specified CSS selector
   * @param {string} selector - the CSS selector to match against elements in DOM
   * @returns {Element|null} The first element of the selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Retrieves all elements from the DOM that match the specified
   * CSS selectors
   * @param {string} selector - the CSS selector to match against elements in DOM
   * @returns {NodeList} all the elements that match the selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
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
