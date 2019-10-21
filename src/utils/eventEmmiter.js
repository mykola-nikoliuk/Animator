import ES6EventEmitter from 'event-emitter-es6';

export default class EventEmitter extends ES6EventEmitter {

  /**
   *
   */
  constructor() {
    super({emitDelay: false});
  }

  /**
   *
   * @param name
   * @param callback
   * @return {function()}
   */
  on(name, callback) {
    super.on(name, callback);
    return () => {
      super.off(name, callback);
    };
  }
}
