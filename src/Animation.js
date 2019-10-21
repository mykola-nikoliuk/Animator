import each from 'lodash/each';
import get from 'lodash/get';
import renderLoop from 'utils/renderLoop';

const PERCENT_WORD = '__percent';
const CALLBACK_WORD = '__callback';

/**
 * @typedef {{ENABLED: number, LOOP: number, SWING: number}} AnimationEnum
 * @enum
 */
export const ENUMS = {
  ENABLED: 1,
  LOOP: 1 << 1,
  SWING: 1 << 2
};

renderLoop.start();

export class Animation {
  /**
   * @param {object} [config]
   * @param {any} [config.target]
   * @param {[]} [config.keyframes]
   * @param {object} [config.updateFunctions]
   * @param {number} [config.duration]
   * @param {number} [config.delay]
   * @param {bool} [config.reversed]
   * @param {string} [config.namespace]
   * @param {function} [config.timeFunction]
   * @param {function} [config.onDeferredEnd]
   * @param {function} [config.onEnd]
   * @param {function} [config.onLoop]
   * @param {number} [config.attributes]
   */
  constructor(config) {
    const {target, keyframes, updateFunctions, duration, delay = 0, reversed = false, namespace = null,
      timeFunction = time => time, onEnd = () => {}, onDeferredEnd = () => {}, onLoop = () => {}, attributes = 0} = config;

    this.target = target;
    this.keyframes = keyframes ? this._parseKeyframe(keyframes) : null;
    this.updateFunctions = updateFunctions;
    this.duration = duration;

    this.delay = delay;
    this.attributes = attributes;
    this.onEnd = onEnd;
    this.onDeferredEnd = onDeferredEnd;
    this.onLoop = onLoop;
    this.timeFunction = timeFunction;
    this.currentTime = 0;
    this.reversed = reversed;
    this.namespace = namespace ? renderLoop.nameSpace(namespace) : renderLoop;

    this.config = config;
    this._unsubscribeFunction = null;

    this._checkKeyframes();
  }

  /**
   * Plays or resume paused animation
   * @return {Animation}
   */
  play() {
    this.setAttribute(ENUMS.ENABLED);
    this._subscribe();
    this._update(0);
    return this;
  }

  /**
   * Pause animation
   * @return {Animation}
   */
  pause() {
    this.removeAttribute(ENUMS.ENABLED);
    this._unsubscribe();
    return this;
  }

  /**
   * Stops animation
   * @return {Animation}
   */
  stop() {
    this.pause();
    this.currentTime = 0;
    this._update(0);
    return this;
  }

  /**
   * Set flag to play animation backward
   * @return {Animation}
   */
  reverse(reversed = null) {
    if (reversed === null) {
      this.reversed = !this.reversed;
    }
    else {
      this.reversed = reversed;
    }
    return this;
  }

  /**
   * Creates clone on animation using combined parameters from parent and child
   * @param config
   * @return {Animation}
   */
  clone(config) {
    return new this.constructor(Object.assign({}, this.config, config));
  }

  /**
   * Set progress to animation from 0 to 1
   * @param {number} progress
   * @return {Animation}
   */
  setProgress(progress) {
    this.currentTime = this.duration * progress;
    this._update(0);
    return this;
  }

  /**
   * Checks is flag presented in animation
   * @param {number} flag
   * @return {boolean}
   */
  hasAttribute(flag) {
    return (this.attributes & flag) === flag;
  }

  get isPlaying() {
    return this.hasAttribute(ENUMS.ENABLED);
  }
  /**
   * Set flag to animation
   * @param flag
   * @return {Animation}
   */
  setAttribute(flag) {
    this.attributes |= flag;
    return this;
  }

  /**
   * Removing attribute
   * @param flag
   * @return {Animation}
   */
  removeAttribute(flag) {
    this.attributes &= ~flag;
    return this;
  }

  _update(delta) {
    if (this.hasAttribute(ENUMS.ENABLED)) {
      this.currentTime += delta;
    }
    const progress = this._getProgress(this._getTimeProgress());

    if (progress >= 0 && progress <= 1) {
      this._animationUpdate(progress);
    }

    if ((progress === 1 && !this.reversed) || (progress === 0 && this.reversed)) {
      if (this.hasAttribute(ENUMS.LOOP)) {
        this.currentTime = 0;
        if (this.hasAttribute(ENUMS.SWING)) {
          this.reversed = !this.reversed;
        }
        this.onLoop();
      }
      else {
        this.currentTime = 0;
        this.pause();
        this.onEnd();
        setTimeout(this.onDeferredEnd);
      }
    }
  }

  _subscribe() {
    if (!this._unsubscribeFunction) {
      this._unsubscribeFunction = this.namespace.on('update', this._update.bind(this));
    }
  }

  _unsubscribe() {
    this._unsubscribeFunction && this._unsubscribeFunction();
    this._unsubscribeFunction = null;
  }

  _getTimeProgress() {
    let timeProgress = this.currentTime >= this.delay ? (this.currentTime - this.delay) / this.duration : 0;
    if (this.reversed) {
      timeProgress = 1 - timeProgress;
    }
    if (timeProgress >= 1 && !this.reversed) {
      timeProgress = 1;
    }
    if (timeProgress <= 0 && this.reversed) {
      timeProgress = 0;
    }
    return timeProgress;
  }

  _getProgress(timeProgress) {
    let progress = this.timeFunction(timeProgress);
    if (progress >= 1 && !this.reversed) {
      progress = 1;
    }
    if (progress <= 0 && this.reversed) {
      progress = 0;
    }
    return progress;
  }

  _animationUpdate(progress) {
    each(this.updateFunctions, (updateFunction, key) => {
      const keyframeRange = Animation._getFromToByField(key, this.keyframes, progress);

      if (keyframeRange.progress >= 0) {
        const keyTokens = key.split('.');
        const subKey = keyTokens.pop();
        const subPath = keyTokens.join('.');
        const subTarget = subPath.length ? get(this.target, keyTokens.join('.'), null) : this.target;
        if (subTarget) {
          updateFunction(subTarget, subKey, keyframeRange);
        } else {
          throw new Error(`Animation:_animationUpdate() : can't resolve path "${key}"`);
        }
      }
    });
  }

  _checkKeyframes() {
    let keyFramesWithoutPercents = 0;
    let previousPercent = 0;

    each(this.keyframes, (keyframe, index) => {
      // TODO: compare updateFunctions and keyframe modificators and add updateFunctions that missed
      if (index === 0) {
        if (keyframe.percent && keyframe.percent !== 0) {
          throw new Error('Animation:animate() : first keyframe must have "percent" field equal undefined or 0');
        }
        else {
          keyframe.percent = 0;
        }
      } else {
        if (index === this.keyframes.length - 1) {
          if (keyframe.percent && keyframe.percent !== 1) {
            throw new Error('Animation:animate() : last keyframe must have "percent" field equal undefined or 1');
          }
          keyframe.percent = 1;
        }

        if (typeof keyframe.percent === 'number') {
          if (keyframe.percent <= previousPercent && keyframe.percent !== 1) {
            throw new Error(`Animation:animate() : wrong queue of "percent". ${typeof keyframe.percent} must be after ${previousPercent}`);
          }
          if (keyFramesWithoutPercents) {
            const step = (keyframe.percent - previousPercent) / (keyFramesWithoutPercents + 1);
            let offset = keyframe.percent - step;
            let indexOffset = 0;
            while (keyFramesWithoutPercents--) {
              this.keyframes[index - ++indexOffset].percent = offset;
              offset -= step;
            }
            keyFramesWithoutPercents = 0;
          }
          previousPercent = keyframe.percent;
        }
        else {
          keyFramesWithoutPercents++;
        }
      }
    });
  }

  _parseKeyframe(rawKeyframes) {
    const keyframes = [];

    rawKeyframes.forEach(rawKeyframe => {
      const keyframe = {modificators: {}};
      const keys = Object.keys(rawKeyframe);

      keys.forEach(key => {
        switch (key) {
          case PERCENT_WORD:
            keyframe.percent = rawKeyframe[key];
            break;
          case CALLBACK_WORD:
            // todo: reserved to create callback on current keyframe
            break;
          default:
            keyframe.modificators[key] = rawKeyframe[key];
        }
      });
      keyframes.push(keyframe);
    });

    return keyframes;
  }

  static _getFromToByField(field, keyframes, progress) {
    let nearPreviousFrame = null;
    let nearNextFrame = null;
    let localProgress = -1;

    each(keyframes, keyframe => {
      if (typeof keyframe.modificators[field] !== 'undefined') {
        if (keyframe.percent <= progress && (nearPreviousFrame === null || keyframe.percent > nearPreviousFrame.percent)) {
          nearPreviousFrame = keyframe;
        }
        if (keyframe.percent >= progress && (nearNextFrame === null || keyframe.percent < nearNextFrame.percent)) {
          nearNextFrame = keyframe;
        }
      }
    });

    if (nearPreviousFrame) {
      if (nearNextFrame) {
        const deltaKeyframe = nearNextFrame.percent - nearPreviousFrame.percent;
        if (deltaKeyframe === 0) {
          localProgress = 1;
        } else {
          localProgress = (progress - nearPreviousFrame.percent) / deltaKeyframe;
        }
      } else {
        localProgress = 0;
      }
    }

    return {
      from: nearPreviousFrame ? nearPreviousFrame.modificators[field] : null,
      to: nearNextFrame ? nearNextFrame.modificators[field] : null,
      progress: localProgress
    };
  }
}

export function UPDATE_NUMBER(target, field, {from, to, progress}) {
  switch (progress) {
    case 0:
      target[field] = from;
      break;

    case 1:
      target[field] = to;
      break;

    default:
      target[field] = (to - from) * progress + from;
  }
}

export function UPDATE_BOOL(target, field, {from}) {
  target[field] = from;
}

export function UPDATE_PATTERN(pattern) {
  return (target, field, {from, to, progress}) => {
    let updatedPattern = pattern;
    let res;
    switch (progress) {
      case 0:
        res = from;
        break;

      case 1:
        res = to;
        break;

      default:
        res = [];
        each(to, (value, index) => {
          const delta = to[index] - from[index];
          let newValue = delta * progress + from[index];
          res.push(newValue);
        });
        break;
    }
    each(res, (value, index) => {
      updatedPattern = updatedPattern.replace(`{${index}}`, value);
    });
    target[field] = updatedPattern;
  };
}
