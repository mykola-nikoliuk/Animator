(() => {
  const div = createExample('opacity');

  const { Animation, ENUMS, UPDATE_NUMBER } = Animator;

  new Animation({
    target: div.style,
    duration: 1000,
    attributes: ENUMS.LOOP,
    keyframes: [{
      opacity: 0,
    }, {
      opacity: 1,
    }],
    updateFunctions: {
      opacity: UPDATE_NUMBER,
    }
  }).play();

})();