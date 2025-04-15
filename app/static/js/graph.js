const svg = document.getElementById('graph');
const createMenu = document.getElementById('createMenu');
const nodeMenu = document.getElementById('nodeMenu');
let nodes = [];
let connections = [];
let dragNode = null;
let connecting = false;
let startNode = null;
let tempLine = null;
let offset = { x: 0, y: 0 };
let clickCoords = { x: 0, y: 0 };
let selectedNode = null;

// Скрытие меню при клике вне
document.addEventListener('click', (e) => {
    createMenu.style.display = 'none';
    nodeMenu.style.display = 'none';
});

// Меню создания узла
svg.addEventListener('contextmenu', (e) => {
    if (e.target === svg) {
        e.preventDefault();
        clickCoords = { x: e.offsetX, y: e.offsetY };

        createMenu.style.display = 'block';
        createMenu.style.left = `${e.pageX}px`;
        createMenu.style.top = `${e.pageY}px`;
        nodeMenu.style.display = 'none';
    }
});

// Меню действий с узлом
svg.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.node-group')) {
        e.preventDefault();
        e.stopPropagation();

        selectedNode = e.target.closest('.node-group');
        const bbox = selectedNode.getBBox();

        nodeMenu.style.display = 'block';
        nodeMenu.style.left = `${e.pageX}px`;
        nodeMenu.style.top = `${e.pageY}px`;
        createMenu.style.display = 'none';
    }
});

// Обработчик выбора типа узла
createMenu.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const type = e.target.dataset.type;
        const name = prompt("Введите имя узла:");
        if (name !== null) {
            createNode(type, clickCoords.x, clickCoords.y, name);
        }
        createMenu.style.display = 'none';
    });
});

// Обработчик действий с узлом
nodeMenu.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const action = e.target.dataset.action;

        if (action === 'rename') {
            const newName = prompt("Введите новое имя:");
            if (newName !== null) {
                const label = selectedNode.querySelector('.node-label');
                label.textContent = newName;
            }
        } else if (action === 'delete') {
            deleteNode(selectedNode);
        } else if (action === 'remove-connections') {
            removeConnections(selectedNode);
        }

        nodeMenu.style.display = 'none';
    });
});

// Удаление узла и связей
function deleteNode(nodeGroup) {
    connections = connections.filter(conn => {
        if (conn.start === nodeGroup || conn.end === nodeGroup) {
            svg.removeChild(conn.element);
            return false;
        }
        return true;
    });

    svg.removeChild(nodeGroup);
    nodes = nodes.filter(n => n !== nodeGroup);
}

// Удаление связей узла
function removeConnections(nodeGroup) {
    connections = connections.filter(conn => {
        if (conn.start === nodeGroup || conn.end === nodeGroup) {
            svg.removeChild(conn.element);
            return false;
        }
        return true;
    });
}

function createNode(type, x, y, name) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.classList.add('node-group');
    let node;
    const shapeClass = type + '-node';
    switch (type) {
        case 'circle':
            node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            node.setAttribute('cx', 0);
            node.setAttribute('cy', 0);
            node.setAttribute('r', 20);
            node.classList.add('node', shapeClass);
            break;
        case 'square':
            node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            node.setAttribute('x', -20);
            node.setAttribute('y', -20);
            node.setAttribute('width', 40);
            node.setAttribute('height', 40);
            node.classList.add('node', shapeClass);
            break;
        case 'triangle':
            // Исправленные координаты для центрирования треугольника
            node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            node.setAttribute('points', "-20,-10 0,20 20,-10"); // Центроид в (0,0)
            node.classList.add('node', shapeClass);
            break;
    }
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.classList.add('node-label');
    label.textContent = name || "Без имени";
    label.setAttribute('y', 40);
    group.appendChild(node);
    group.appendChild(label);
    group.setAttribute('transform', `translate(${x}, ${y})`);
    svg.appendChild(group);
    nodes.push(group);
    return group;
}

// Начало создания связи
svg.addEventListener('mousedown', (e) => {
    if (e.target.closest('.node-group') && e.button === 0 && !connecting) {
        startNode = e.target.closest('.node-group');
        connecting = true;

        tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tempLine.setAttribute('stroke', '#555');
        tempLine.setAttribute('stroke-width', 2);
        tempLine.setAttribute('class', 'connection');
        svg.appendChild(tempLine);

        updateTempLine(e.offsetX, e.offsetY);
    }
});

// Обновление временной линии
function updateTempLine(x, y) {
    if (tempLine && startNode) {
        const start = getNodeCenter(startNode);
        tempLine.setAttribute('x1', start.x);
        tempLine.setAttribute('y1', start.y);
        tempLine.setAttribute('x2', x);
        tempLine.setAttribute('y2', y);
    }
}

// Завершение создания связи
svg.addEventListener('mouseup', (e) => {
    if (connecting) {
        const targetNode = e.target.closest('.node-group');
        if (targetNode && targetNode !== startNode) {
            const endNode = targetNode;

            const connection = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            connection.classList.add('connection');
            svg.insertBefore(connection, svg.firstChild);

            updateConnection(connection, startNode, endNode);

            connections.push({
                start: startNode,
                end: endNode,
                element: connection
            });
        }

        if (tempLine && tempLine.parentNode) {
            svg.removeChild(tempLine);
        }
        tempLine = null;
        connecting = false;
        startNode = null;
    }
});

// Перетаскивание узлов
svg.addEventListener('mousedown', (e) => {
    const group = e.target.closest('.node-group');
    if (group && e.button === 0 && !connecting) {
        dragNode = group;
        const bbox = group.getBBox();

        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursor = pt.matrixTransform(group.getScreenCTM().inverse());

        offset.x = cursor.x - bbox.x;
        offset.y = cursor.y - bbox.y;
    }
});

svg.addEventListener('mousemove', (e) => {
    if (dragNode) {
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursor = pt.matrixTransform(dragNode.getScreenCTM().inverse());

        const x = cursor.x - offset.x;
        const y = cursor.y - offset.y;

        dragNode.setAttribute('transform', `translate(${x}, ${y})`);

        connections.forEach(conn => {
            if (conn.start === dragNode || conn.end === dragNode) {
                updateConnection(conn.element, conn.start, conn.end);
            }
        });
    }

    if (connecting) {
        updateTempLine(e.offsetX, e.offsetY);
    }
});

svg.addEventListener('mouseup', () => {
    dragNode = null;
});

// Обновление связи
function updateConnection(line, startNode, endNode) {
    const start = getNodeCenter(startNode);
    const end = getNodeCenter(endNode);

    line.setAttribute('x1', start.x);
    line.setAttribute('y1', start.y);
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
}

function getNodeCenter(nodeGroup) {
    const matrix = nodeGroup.getCTM() || { e: 0, f: 0 };
    const bbox = nodeGroup.getBBox();
    return {
        // Убраны bbox.x и bbox.y, так как элементы уже позиционированы относительно центра группы
        x: matrix.e + bbox.width / 2,
        y: matrix.f + bbox.height / 2
    };
}

// Загрузка графа
document.getElementById('loadInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
        try {
            const data = JSON.parse(reader.result);
            clearGraph();
            loadGraph(data);
        } catch (err) {
            alert('Ошибка загрузки файла');
        }
    };
    reader.readAsText(file);
});

// Очистка графа
function clearGraph() {
    nodes.forEach(node => svg.removeChild(node));
    connections.forEach(conn => svg.removeChild(conn.element));
    nodes = [];
    connections = [];
}

// Исправленная функция сохранения графа
function saveGraph() {
    try {
        const data = {
            nodes: nodes.map(node => {
                const matrix = node.getCTM() || { e: 0, f: 0 };
                return {
                    type: node.querySelector('.node').classList[1],
                    x: matrix.e,
                    y: matrix.f,
                    name: node.querySelector('.node-label').textContent
                };
            }),
            connections: connections.map(conn => ({
                start: nodes.indexOf(conn.start),
                end: nodes.indexOf(conn.end)
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'graph.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        alert('Ошибка сохранения: ' + e.message);
    }
}

// Исправленная функция загрузки графа
function loadGraph(data) {
    try {
        clearGraph();

        // Создаем узлы
        const loadedNodes = data.nodes.map(nodeData => {
            const type = nodeData.type.replace('-node', '');
            return createNode(type, nodeData.x, nodeData.y, nodeData.name);
        });

        // Создаем связи
        data.connections.forEach(connData => {
            const startNode = loadedNodes[connData.start];
            const endNode = loadedNodes[connData.end];

            if (startNode && endNode) {
                const connection = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                connection.classList.add('connection');
                svg.insertBefore(connection, svg.firstChild);

                updateConnection(connection, startNode, endNode);

                connections.push({
                    start: startNode,
                    end: endNode,
                    element: connection
                });
            }
        });
    } catch (e) {
        alert('Ошибка загрузки: ' + e.message);
    }
}