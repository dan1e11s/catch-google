import { EVENTS, GAME_STATUSES, MOVING_DIRECTIONS } from './constants.js';

const _state = {
  gameStatus: GAME_STATUSES.SETTINGS,
  points: {
    google: 0,
    players: [0, 0],
  },
  settings: {
    gridSize: {
      rowsCount: 5,
      columnsCount: 5,
    },
    googleJumpInterval: 2000,
    pointsToLose: 10,
    pointsToWin: 10,
  },
  positions: {
    google: { x: 4, y: 1 },
    players: [
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ],
  },
};

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

function _generateNewNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function _jumpGoogleToNewPosition() {
  const newPosition = { ..._state.positions.google };

  do {
    newPosition.x = _generateNewNumber(
      0,
      _state.settings.gridSize.columnsCount - 1
    );
    newPosition.y = _generateNewNumber(
      0,
      _state.settings.gridSize.rowsCount - 1
    );
  } while (
    _doesPositionMatchWithPlayer1Position(newPosition) ||
    _doesPositionMatchWithPlayer2Position(newPosition) ||
    _doesPositionMatchWithGooglePosition(newPosition)
  );

  _state.positions.google = newPosition;
}

function _getPlayerIndexByNumber(playerNumber) {
  const playerIndex = playerNumber - 1;

  if (playerIndex < 0 || playerIndex > _state.points.players.length - 1) {
    throw new Error('Incorrect player number!');
  }

  return playerIndex;
}

let jumpGoogleInterval;

function _doesPositionMatchWithPlayer1Position(newPosition) {
  return (
    newPosition.x === _state.positions.players[0].x &&
    newPosition.y === _state.positions.players[0].y
  );
}

function _doesPositionMatchWithPlayer2Position(newPosition) {
  return (
    newPosition.x === _state.positions.players[1].x &&
    newPosition.y === _state.positions.players[1].y
  );
}

function _doesPositionMatchWithGooglePosition(newPosition) {
  return (
    newPosition.x === _state.positions.google.x &&
    newPosition.y === _state.positions.google.y
  );
}

function _isPositionInValidRange(position) {
  if (position.x < 0 || position.x >= _state.settings.gridSize.columnsCount)
    return false;
  if (position.y < 0 || position.y >= _state.settings.gridSize.columnsCount)
    return false;

  return true;
}

function _catchGoogle(playerNumber) {
  const playerIndex = _getPlayerIndexByNumber(playerNumber);

  _state.points.players[playerIndex]++;
  _notifyObservers(EVENTS.SCORES_CHANGED);
  _notifyObservers(EVENTS.GOOGLE_CAUGHT);

  if (_state.points.players[playerIndex] === _state.settings.pointsToWin) {
    _state.gameStatus = GAME_STATUSES.WIN;
    _notifyObservers(EVENTS.STATUS_CHANGED);
    clearInterval(jumpGoogleInterval);
  } else {
    const prevPosition = { ..._state.positions.google };
    _jumpGoogleToNewPosition();
    _notifyObservers(EVENTS.GOOGLE_JUMPED, {
      prevPosition,
      newPosition: _state.positions.google,
    });
  }
}

// ============================== INTERFACE/ADAPTER ==================================================

// SETTERS/COMMANDS
export async function start() {
  if (_state.gameStatus !== GAME_STATUSES.SETTINGS)
    throw new Error(
      `Incorrect transition from "${_state.gameStatus}" to "${GAME_STATUSES.IN_PROGRESS}" `
    );

  _state.positions.players[0] = { x: 0, y: 0 };
  _state.positions.players[1] = {
    x: _state.settings.gridSize.columnsCount - 1,
    y: _state.settings.gridSize.rowsCount - 1,
  };
  _jumpGoogleToNewPosition();

  _state.points.google = 0;
  _state.points.players = [0, 0];

  jumpGoogleInterval = setInterval(() => {
    const prevPosition = { ..._state.positions.google };
    _jumpGoogleToNewPosition();
    _notifyObservers(EVENTS.GOOGLE_JUMPED, {
      prevPosition,
      newPosition: { ..._state.positions.google },
    });
    _notifyObservers(EVENTS.GOOGLE_RUN_AWAY);

    _state.points.google++;
    _notifyObservers(EVENTS.SCORES_CHANGED);

    if (_state.points.google === _state.settings.pointsToLose) {
      clearInterval(jumpGoogleInterval);
      _state.gameStatus = GAME_STATUSES.LOSE;
      _notifyObservers(EVENTS.STATUS_CHANGED);
    }
  }, _state.settings.googleJumpInterval);

  _state.gameStatus = GAME_STATUSES.IN_PROGRESS;
  _notifyObservers(EVENTS.STATUS_CHANGED);
}

export async function playAgain() {
  _state.gameStatus = GAME_STATUSES.SETTINGS;
  _notifyObservers(EVENTS.STATUS_CHANGED);
}

export async function movePlayer(playerNumber, direction) {
  if (_state.gameStatus !== GAME_STATUSES.IN_PROGRESS) {
    console.warn('You can move player only when game is in progress!');
    return;
  }

  const playerIndex = _getPlayerIndexByNumber(playerNumber);

  const prevPosition = { ..._state.positions.players[playerIndex] };
  const newPosition = { ..._state.positions.players[playerIndex] };

  switch (direction) {
    case MOVING_DIRECTIONS.UP:
      newPosition.y--;
      break;
    case MOVING_DIRECTIONS.DOWN:
      newPosition.y++;
      break;
    case MOVING_DIRECTIONS.LEFT:
      newPosition.x--;
      break;
    case MOVING_DIRECTIONS.RIGHT:
      newPosition.x++;
      break;
  }

  const isValidRange = _isPositionInValidRange(newPosition);
  if (!isValidRange) return;

  const isPlayer1PositionTheSame =
    _doesPositionMatchWithPlayer1Position(newPosition);
  if (isPlayer1PositionTheSame) return;

  const isPlayer2PositionTheSame =
    _doesPositionMatchWithPlayer2Position(newPosition);
  if (isPlayer2PositionTheSame) return;

  const isGooglePositionTheSame =
    _doesPositionMatchWithGooglePosition(newPosition);

  if (isGooglePositionTheSame) {
    _catchGoogle(playerNumber);
  }

  _state.positions.players[playerIndex] = newPosition;
  _notifyObservers(EVENTS[`PLAYER${playerNumber}_MOVED`], {
    prevPosition,
    newPosition,
  });
}

// GETTERS/SELECTORS
export async function getGameStatus() {
  return _state.gameStatus;
}

export async function getGooglePoints() {
  return _state.points.google;
}

export async function getPlayerPoints(playerNumber) {
  const playerIndex = _getPlayerIndexByNumber(playerNumber);

  return _state.points.players[playerIndex];
}

export async function getGridSize() {
  return { ..._state.settings.gridSize };
}

export async function getGooglePosition() {
  return { ..._state.positions.google };
}

export async function getPlayerPosition(playerNumber) {
  const playerIndex = _getPlayerIndexByNumber(playerNumber);

  return { ..._state.positions.players[playerIndex] };
}
