(() => {
  const div = createExample('independent animations');
  div.style.position = 'relative';

  const { Animation, ENUMS, UPDATE_NUMBER, createModificator } = Animator;

  const updatePixel = createModificator(UPDATE_NUMBER, value => `${value}px`);
  const updateTransformRotate = createModificator(UPDATE_NUMBER, value => `rotateZ(${value}deg)`);


  new Animation({
    target: div.style,
    duration: 1000,
    attributes: ENUMS.LOOP | ENUMS.SWING,
    keyframes: [{
      left: 0,
    }, {
      left: 100,
    }],
    updateFunctions: {
      left: updatePixel,
    }
  }).play();

  new Animation({
    target: div.style,
    duration: 1200,
    attributes: ENUMS.LOOP,
    keyframes: [{
      transform: 0,
    }, {
      transform: 180,
    }],
    updateFunctions: {
      transform: updateTransformRotate,
    }
  }).play();

})();