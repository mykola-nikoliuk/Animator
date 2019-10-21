const createExample = name => {
  const wrapper = document.createElement('div');
  const title = document.createElement('div');
  const div = document.createElement('div');

  wrapper.className = 'wrapper';
  title.className = 'title';
  div.className = 'square';
  title.innerText = name;

  wrapper.appendChild(title);
  wrapper.appendChild(div);
  document.body.appendChild(wrapper);

  return div;
};