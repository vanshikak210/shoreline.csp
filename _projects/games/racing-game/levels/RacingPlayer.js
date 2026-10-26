import EnginePlayer from '@assets/js/GameEnginev1.1/essentials/Player.js';

// Keep the class name Player: the racing HUD uses it to find both cars.
export default class Player extends EnginePlayer {
  handleKeyDown(event) {
    const target = event.target;
    const editing = target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || '');
    const control = this.gameEnv?.gameControl;
    if (editing || event.altKey || event.ctrlKey || event.metaKey || !control || control.isPaused) return;
    if (this.gameEnv.container?.isConnected === false) return;

    // The engine owns key mapping, movement, and arrow-key scroll prevention.
    super.handleKeyDown(event);
  }
}
