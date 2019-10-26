(() => {
  const div = createExample('swing');
  div.style.position = 'relative';

  const { Animation, ENUMS, UPDATE_NUMBER, createModificator } = Animator;

  const updatePixel = createModificator(UPDATE_NUMBER, value => `${value}px`);

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

})();