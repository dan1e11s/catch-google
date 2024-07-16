const eventSource = new EventSource('http://localhost:3000/events');

eventSource.addEventListener('message', (ese) => {
  const event = JSON.parse(ese.data);
  _notifyObservers(event.name, event.payload);
});

// OBSERVER
let _observers = [];
export function subscribe(observer) {
  _observers.push(observer);
}

export function unsubscribe(observer) {
  _observers = _observers.filter((o) => o !== observer);
}

function _notifyObservers(name, payload = {}) {
  const event = {
    name,
    payload,
  };
  _observers.forEach((o) => {
    try {
      o(event);
    } catch (error) {
      console.error(error);
    }
  });
}

// ============================== INTERFACE/ADAPTER ==================================================

// SETTERS/COMMANDS
export async function start() {
  fetch('http://localhost:3000/start');
}

export async function playAgain() {
  fetch('http://localhost:3000/playAgain');
}

export async function movePlayer(playerNumber, direction) {
  fetch(
    `http://localhost:3000/movePlayer?playerNumber=${playerNumber}&direction=${direction}`
  );
}

// GETTERS/SELECTORS
export async function getGameStatus() {
  const responce = await fetch('http://localhost:3000/getGameStatus');
  const responcePayload = await responce.json();

  return responcePayload.data;
}

export async function getGooglePoints() {
  const responce = await fetch('http://localhost:3000/getGooglePoints');
  const responcePayload = await responce.json();

  return responcePayload.data;
}

export async function getPlayerPoints(playerNumber) {
  const responce = await fetch(
    `http://localhost:3000/getPlayerPoints?playerNumber=${playerNumber}`
  );
  const responcePayload = await responce.json();

  return responcePayload.data;
}

export async function getGridSize() {
  const responce = await fetch('http://localhost:3000/getGridSize');
  const responcePayload = await responce.json();

  return responcePayload.data;
}

export async function getGooglePosition() {
  const responce = await fetch('http://localhost:3000/getGooglePosition');
  const responcePayload = await responce.json();

  return responcePayload.data;
}

export async function getPlayerPosition(playerNumber) {
  const responce = await fetch(
    `http://localhost:3000/getPlayerPosition?playerNumber=${playerNumber}`
  );
  const responcePayload = await responce.json();

  return responcePayload.data;
}
