import { EVENTS } from '../../../../core/constants.js';
import {
  getGooglePosition,
  getPlayerPosition,
  subscribe,
  unsubscribe,
} from '../../../../core/state-manager.js';
import { GoogleComponent } from '../../common/Google/Google.component.js';
import { PlayerComponent } from '../../common/Player/Google.component.js';

export function CellComponent(x, y) {
  const localState = { renderVersion: 0 };

  const element = document.createElement('td');

  const observer = (e) => {
    if (
      [EVENTS.GOOGLE_JUMPED, EVENTS.PLAYER1_MOVED, EVENTS.PLAYER2_MOVED].every(
        (name) => name !== e.name
      )
    )
      return;

    if (e.payload.prevPosition.x === x && e.payload.prevPosition.y === y) {
      render(element, x, y, localState);
    }

    if (e.payload.newPosition.x === x && e.payload.newPosition.y === y) {
      render(element, x, y, localState);
    }
  };

  subscribe(observer);

  render(element, x, y, localState);

  return { element, cleanUp: () => unsubscribe(observer) };
}

async function render(element, x, y, localState) {
  localState.renderVersion++;
  const currentRenderVersion = localState.renderVersion;

  element.innerHTML = '';

  const googlePosition = await getGooglePosition();
  const player1Position = await getPlayerPosition(1);
  const player2Position = await getPlayerPosition(2);

  if (currentRenderVersion < localState.renderVersion) return;

  if (googlePosition.x === x && googlePosition.y === y) {
    element.append(GoogleComponent().element);
  }

  if (player1Position.x === x && player1Position.y === y) {
    element.append(PlayerComponent(1).element);
  }

  if (player2Position.x === x && player2Position.y === y) {
    element.append(PlayerComponent(2).element);
  }
}
