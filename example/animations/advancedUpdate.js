(() => {
  const div = createExample('advanced update');
  div.style.position = 'relative';

  const { Animation, ENUMS, createModificator } = Animator;

  const colorUpdate = createModificator(arrayUpdate, value => `rgba(${value.join(', ')})`);

  new Animation({
    target: div.style,
    duration: 3000,
    attributes: ENUMS.LOOP,
    keyframes: [{
      backgroundColor: [255, 0, 0, 1],
    }, {
      backgroundColor: [0, 255, 0, 1],
    }, {
      backgroundColor: [0, 0, 255, 1],
    }, {
      backgroundColor: [255, 0, 0, 1],
    }, {
      backgroundColor: [255, 0, 0, 0.1],
    }, {
      backgroundColor: [255, 0, 0, 1],
    }],
    updateFunctions: {
      backgroundColor: colorUpdate,
    }
  }).play();

  function arrayUpdate({from, to, progress}) {
    switch (progress) {
      case 0:
        return from;
      case 1:
        return to;
      default:
        const result = [];
        from.map((value, index) => {
          result.push((to[index] - value) * progress + value);
        });
        return result;
    }
  }

})();