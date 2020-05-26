import get from 'lodash/get';
import EventEmitter from './eventEmmiter';

export class RenderLoopScope extends EventEmitter {

  constructor(namespace, scopes) {
    super();
    this.namespace = namespace;
    this.childScopes = {};
    this.parentScopes = scopes;
    this.isNeedToRender = false;
    this.parent = null;
  }

  addChild(scope) {
    delete scope.parentScopes[scope.namespace];
    this.childScopes[scope.namespace] = scope;
    scope.parent = this;
  }

  renderOnNextTick() {
    this.isNeedToRender = true;
    if (this.parent) {
      this.parent.renderOnNextTick();
    }
  }

  emitUpdate(dTime) {
    const isExistListeners = get(this, '_listeners.update.length');
    if (isExistListeners) {
      this.renderOnNextTick();
    }
    this.emit('update', dTime);
  }

  emitRender(dTime) {
    if (this.isNeedToRender) {
      this.isNeedToRender = false;
      this.emit('render', dTime);
    }
  }
}
