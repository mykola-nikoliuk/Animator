(() => {
  const div = createExample('parallel');
  div.style.position = 'relative';

  const { Animation, ENUMS, UPDATE_NUMBER, createModificator } = Animator;

  const updatePixel = createModificator(UPDATE_NUMBER, value => `${value}px`);
  const updateTransformRotate = createModificator(UPDATE_NUMBER, value => `rotateZ(${value}deg)`);


  new Animation({
    target: div.style,
    duration: 2000,
    attributes: ENUMS.LOOP | ENUMS.SWING,
    keyframes: [{
      left: 0,
      opacity: 0,
      transform: 0,
    }, {
      left: 100,
      opacity: 1,
      transform: 180,
    }],
    updateFunctions: {
      opacity: UPDATE_NUMBER,
      left: updatePixel,
      transform: updateTransformRotate,
    }
  }).play();

})();