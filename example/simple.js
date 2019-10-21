const div = document.createElement('div');

Object.assign(div.style, {
  width: '100px',
  height: '100px',
  position: 'absolute',
  top: '100px',
  backgroundColor: 'red'
});

document.body.appendChild(div);


const { Animation, ENUMS, UPDATE_NUMBER} = Animator;

const animation = new Animation({
  target: div.style,
  duration: 1000,
  attributes: ENUMS.LOOP | ENUMS.SWING,
  keyframes: [{
    opacity: 0,
    left: 100,
    transform: 0,
  }, {
    opacity: 1,
    left: 100,
  }, {
    left: 400,
    top: 100,
  }, {
    top: 400,
    transform: 0,
  }, {
    transform: 180,
  }],
  updateFunctions: {
    opacity: UPDATE_NUMBER,
    left: updatePixel,
    top: updatePixel,
    transform: updateTransformRotate,
  }
}).setAttribute();

animation.play();

function updatePixel(target, field, {from, to, progress}) {
  let value;

  switch (progress) {
    case 0:
      value = from;
      break;

    case 1:
      value = to;
      break;

    default:
      value = (to - from) * progress + from;
  }

  target[field] = `${value}px`;
}

function updateTransformRotate(target, field, {from, to, progress}) {
  let value;

  switch (progress) {
    case 0:
      value = from;
      break;

    case 1:
      value = to;
      break;

    default:
      value = (to - from) * progress + from;
  }

  target[field] = `rotateZ(${value}deg)`;
}