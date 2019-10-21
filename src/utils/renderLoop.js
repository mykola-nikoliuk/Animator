import {RenderLoopScope} from 'utils/renderLoopScope';
import EventEmitter from 'utils/eventEmmiter';
import each from 'lodash/each';

let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

/**
 * wrapper around request animation frame. singleton
 * may trigger two events:<br>
 *     'update' - where you calculate new properties <br>
 *     'render' - where you apply calculated properties <br>
 *      usage AnimationLoop.on('render', () => {});
 *
 */
class AnimationLoop extends EventEmitter {

  constructor() {
    super();
    this.functionDistribution = [];
    this.scopes = {};
    this.scopeRegister = {};
    this.renderLoopOn = false;
  }

  start() {
    if (!this.renderLoopOn) {
      this.prevTime = 0;
      this.renderLoopOn = true;
      this.loop(0);
    }
  }

  stop() {
    this.renderLoopOn = false;
  }

  addScope(namespace) {
    const scope = new RenderLoopScope(namespace, this.scopes);
    this.scopes[namespace] = scope;
    this.scopeRegister[namespace] = scope;
    //initial render
    scope.renderOnNextTick();
  }

  /**
   *
   */
  nameSpace(namespace, parentNamespace) {
    if (!this.scopeRegister[namespace]) {
      this.addScope(namespace);
    }
    if (parentNamespace) {
      if (!this.scopeRegister[parentNamespace]) {
        this.addScope(parentNamespace);
      }
      this.nameSpace(parentNamespace).addChild(this.scopeRegister[namespace]);
    }
    return this.scopeRegister[namespace];
  }

  /**
   *
   */
  runDistribution() {
    this.functionDistribution.shift()();
  }

  /**
   * starts animation loop
   * @param {number} time - how match time actually passed from start animation
   */
  loop(time) {
    let dTime = time - this.prevTime;

    this.eachScope(this.scopes, (scope) => {
      scope.emitUpdate(dTime);
    });
    this.emit('update', dTime);

    this.functionDistribution.length && this.runDistribution();

    this.eachScope(this.scopes, (scope) => {
      scope.emitRender(dTime);
    });

    this.emit('render', dTime);

    this.renderLoopOn && this.requestAnimationFrame(this.loop.bind(this));//make MS works
    this.prevTime = time;
  }

  /**
   *
   */
  eachScope(scopes = this.scopes, callback) {
    each(scopes, (scope) => {
      this.eachScope(scope.childScopes, callback);
      callback(scope);
    });
  }

  requestAnimationFrame(callback) {
    requestAnimationFrame.call(window, callback);
  }

  /**
   * add functions that will be fired in different keyframes
   * @param {function[]} functions
   */
  addDistributedFunction(functions) {
    this.functionDistribution = this.functionDistribution.concat(functions);
  }
}

export default new AnimationLoop();
