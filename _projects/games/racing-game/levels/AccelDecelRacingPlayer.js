import EnginePlayer from '@assets/js/GameEnginev1.1/essentials/Player.js';

const ARROW_KEYS = new Set([37, 38, 39, 40]);

export default class Player extends EnginePlayer {
  constructor(gameEnv, data) {
    super(gameEnv, data);
    this.keysPressed = {};
  }

  handleKeyDown(event) {
    const target = event.target;
    const editing = target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || '');
    const control = this.gameEnv?.gameControl;
    if (editing || event.altKey || event.ctrlKey || event.metaKey || !control || control.isPaused) return;
    if (this.gameEnv.container?.isConnected === false) return;

    this.keysPressed[event.keyCode] = true;

    if (ARROW_KEYS.has(event.keyCode) && Object.values(this.keypress).includes(event.keyCode)) {
      event.preventDefault();
    }
    super.handleKeyDown(event);
  }

  handleKeyUp(event) {
    this.keysPressed[event.keyCode] = false;
    if (super.handleKeyUp) {
      super.handleKeyUp(event);
    }
  }

  update() {
    super.update();

    // ONLY run acceleration physics if this specific car has maxSpeed defined
    if (this.maxSpeed !== undefined) {
      const upKey = this.keypress.up;
      const downKey = this.keypress.down;

      if (this.keysPressed[upKey]) {
        this.currentSpeed = Math.min(this.currentSpeed + this.acceleration, this.maxSpeed);
      } else if (this.keysPressed[downKey]) {
        this.currentSpeed = Math.max(this.currentSpeed - this.acceleration, this.reverseSpeed);
      } else {
        if (this.currentSpeed > 0) {
          this.currentSpeed = Math.max(this.currentSpeed - this.deceleration, 0);
        } else if (this.currentSpeed < 0) {
          this.currentSpeed = Math.min(this.currentSpeed + this.deceleration, 0);
        }
      }

      // Map currentSpeed back to STEP_FACTOR so the parent engine moves the car
      this.STEP_FACTOR = Math.abs(this.currentSpeed) * 100; 
    }
  }
}