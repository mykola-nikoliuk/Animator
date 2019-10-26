(() => {
  const div = createExample('chains');
  div.style.position = 'relative';

  const { Animation, ENUMS, UPDATE_NUMBER, createModificator } = Animator;

  const updatePixel = createModificator(UPDATE_NUMBER, value => `${value}px`);
  const updateTransformRotate = createModificator(UPDATE_NUMBER, value => `rotateZ(${value}deg)`);


  new Animation({
    target: div.style,
    duration: 2000,
    attributes: ENUMS.LOOP,
    keyframes: [{
      left: 0,
    }, {
      left: 100,
      transform: 0,
    }, {
      transform: 90,
    }],
    updateFunctions: {
      left: updatePixel,
      transform: updateTransformRotate,
    }
  }).play();

})();