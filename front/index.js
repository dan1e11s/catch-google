import { subscribe } from '../core/state-manager.js';
import { AppComponent } from './components/App.component.js';

const rootElement = document.getElementById('root');

rootElement.innerHTML = '';

const appElement = AppComponent();

rootElement.append(appElement.element);
