import { getPlayerPoints, playAgain } from '../../../core/state-manager.js';

export function WinComponent() {
  const element = document.createElement('div');

  render(element);

  return { element };
}

async function render(element) {
  const player1Points = await getPlayerPoints(1);
  const player2Points = await getPlayerPoints(2);

  const titleElement = document.createElement('h1');

  if (player1Points > player2Points) {
    titleElement.append('PLAYER1 WIN!');
  } else if (player2Points > player1Points) {
    titleElement.append('PLAYER 2 WIN');
  }

  element.append(titleElement);

  const button = document.createElement('button');
  button.append('PLAY AGAIN');
  button.addEventListener('click', () => {
    playAgain();
  });
  element.append(button);
}
