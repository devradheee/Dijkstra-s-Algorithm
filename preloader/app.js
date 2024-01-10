function visualizeGraph() {
    // Existing graph visualization code...
    const graphData = document.getElementById('graphData').value.trim();
    const inputArray = graphData.split(',');

    const edges = inputArray.map(edge => {
        const [source, target, weight] = edge.trim().split(' ');
        return {
            source,
            target,
            weight: Number(weight)
        };
    });

    const nodes = Array.from(new Set(edges.flatMap(d => [d.source, d.target]))).map(id => ({
        id
    }));

    const svg = d3.select("#graph"),
        width = +svg.attr("width"),
        height = +svg.attr("height");



    svg.attr("width", width).attr("height", height);

    svg.selectAll("*").remove(); // Clear previous graph

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges).id(d => d.id).distance(150)) // Adjust the distance as needed
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.selectAll(".link")
        .data(edges)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke", "#000")
        .style("stroke-opacity", 0.2)
        .attr("stroke-width", d => d.weight);

    const node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 10)
        .attr("fill", "#000")
        .attr("stroke", "#fff")
        .attr("stroke-width", "2px");

    const nodeText = svg.selectAll(".nodeText")
        .data(nodes)
        .enter().append("text")
        .attr("class", "nodeText")
        .attr("dy", 2)
        .text(d => d.id);

    const weightText = svg.selectAll(".weightText")
        .data(edges)
        .enter().append("text")
        .attr("class", "weightText")
        .attr("dy", -5)
        .text(d => d.weight);

    // Set up drag behavior for nodes

    const drag = simulation => {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    };

    node.call(drag(simulation));

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        nodeText
            .attr("x", d => d.x)
            .attr("y", d => d.y);

        weightText
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2);
    });
}
// Your other Dijkstra's algorithm implementation...
function dijkstra(graph, source) {
    const distances = {};
    const visited = {};
    const queue = {};
    const paths = {};

    // Initialize distances to infinity and add the source node to the queue
    Object.keys(graph).forEach(node => {
        distances[node] = node === source ? 0 : Infinity;
        paths[node] = [];
    });

    queue[source] = 0;

    while (Object.keys(queue).length) {
        const currentNode = Object.keys(queue).reduce((a, b) => (queue[a] < queue[b] ? a : b));
        delete queue[currentNode];

        if (visited[currentNode]) {
            continue;
        }

        visited[currentNode] = true;

        // Explore neighbors and update distances
        Object.keys(graph[currentNode]).forEach(neighbor => {
            const weight = graph[currentNode][neighbor];
            const totalDistance = distances[currentNode] + weight;

            if (totalDistance < distances[neighbor]) {
                distances[neighbor] = totalDistance;
                paths[neighbor] = [...paths[currentNode], currentNode];
                queue[neighbor] = totalDistance;
            }
        });
    }

    return {
        distances,
        paths
    };
}

const visualizeButton = document.getElementById('visualizeButton');
visualizeButton.addEventListener('click', () => {
    const graphData = document.getElementById('graphData').value.trim();
    const inputArray = graphData.split(',');
    const graph = {};

    inputArray.forEach(edge => {
        const [source, target, weight] = edge.trim().split(' ');
        if (!graph[source]) {
            graph[source] = {};
        }
        graph[source][target] = +weight;
    });

    const sourceNode = document.getElementById('sourceNode').value.trim();

    // Perform Dijkstra's algorithm using the selected source node
    const shortestPaths = dijkstra(graph, sourceNode);

    const resultElement = document.getElementById('result');
    resultElement.innerHTML = '<h2>Shortest Paths from Source Node</h2>';
    // Display the shortest paths in the resultElement
    Object.keys(shortestPaths.distances).forEach(node => {
        const distance = shortestPaths.distances[node];
        // const path = shortestPaths.paths[node].join('->');
        const path = shortestPaths.paths[node].join('<i class=" fas fa-arrow-right" style="margin: 0 5px;"></i>');

         
        
        resultElement.innerHTML += `<p>Node ${sourceNode} to Node ${node}: <span style="color: green">${distance}</span>  Path: ${path}</p>`;
    });
});


