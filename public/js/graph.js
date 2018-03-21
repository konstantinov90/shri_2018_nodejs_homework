/* eslint-disable no-undef */
// инициализируем граф
const g = new dagreD3.graphlib.Graph()
  .setGraph({ rankDir: 'BT' })
  .setDefaultEdgeLabel(() => ({}));

// вставляем узлы графа
document.querySelectorAll('.graph-node').forEach((n) => {
  const subj = n.dataset.subject;
  let trimmedSubj = subj.slice(0, 20);
  if (trimmedSubj.length < subj.length) {
    trimmedSubj += '...';
  }
  const link = `<a href='/commit/${n.id}/'>${trimmedSubj}</a>`;

  g.setNode(n.id, { labelType: 'html', label: link, description: subj });
});

// вставляем ребра графа
document.querySelectorAll('.graph-node').forEach((n) => {
  const parents = n.dataset.parents.split(' ');
  parents.forEach((p) => {
    if (g.nodes().includes(p)) {
      g.setEdge(p, n.id);
    }
  });
});

// красивости
g.nodes().forEach((v) => {
  const node = g.node(v);
  node.rx = 5;
  node.ry = 5;
});

// создаем рендерер
/* eslint-disable new-cap */
const render = new dagreD3.render();
/* eslint-enable new-cap */

// Set up an SVG group so that we can translate the final graph.
const svg = d3.select('svg');
const svgGroup = svg.append('g');

// Run the renderer. This is what draws the final graph.
render(d3.select('svg g'), g);

// Center the graph
const xCenterOffset = (svg.node().width.baseVal.value - g.graph().width) / 2;
svgGroup.attr('transform', `translate(${xCenterOffset} 20)`);
svg.attr('height', g.graph().height + 40);

// заставим работать кнопки
document.querySelector('.graph-btn').addEventListener('click', () => {
  document.querySelector('svg').classList.toggle('hidden');
});

document.querySelector('.list-btn').addEventListener('click', () => {
  document.querySelector('.list').classList.toggle('hidden');
});

// разберемся с тултипом (для длинных коммит месседжей)
const tooltip = document.querySelector('.tooltip');

g.nodes().forEach((v) => {
  const node = g.node(v);
  node.elem.dataset.description = node.description;
  node.elem.addEventListener('mouseover', () => {
    tooltip.classList.remove('hidden');
    tooltip.innerHTML = node.description;
  });
  node.elem.addEventListener('mousemove', ({ pageX, pageY }) => {
    tooltip.style.left = `${pageX + 10}px`;
    tooltip.style.top = `${pageY + 10}px`;
  });
  node.elem.addEventListener('mouseout', () => {
    tooltip.classList.add('hidden');
  });
});

