$(document).ready(function(){
    const input = document.getElementById('rna_seq');
    input.addEventListener('keypress', function inputKeypressHandler(e) {
        const key = e.key;
        if (!((key == 'A') || (key == 'U') || (key == 'G') || (key == "C"))) {
            e.preventDefault();
        }
    });

    const hairpin_length_input = document.getElementById('hairpin_length');
    hairpin_length_input.addEventListener('keypress', function inputKeypressHandler(e) {
        const key = e.key;
        if (!((key == '0') || (key == '1') || (key == '2') || (key == "3")
            || (key == "4") || (key == "5") || (key == "6") || (key == "7")
            || (key == "8") || (key == "9"))) {
            e.preventDefault();
        }
    });

    $('#hairpin_length').bind('input', function () {
        calculateNussinov();
    });

    $('#regular_nucelotide_input').bind('input', function () {
        createForceGraph();
    });

    $('#match_basepair_input').bind('input', function () {
        createForceGraph();
    });

    $('#charge_input').bind('input', function () {
        createForceGraph();
    });

    $('#rna_seq').bind('input', function() {
        calculateNussinov();
    });

    $('#matrixTable').on('mouseenter mouseleave','td', function(e) {
        // Construct the tooltip
        var x_cell = this.parentNode.rowIndex, y_cell = this.cellIndex;
        if (x_cell < 1 || y_cell < 1) return;
        let back_cells = backpointers[x_cell-1][y_cell-1];
        var targetDom = $('#' + x_cell + '_' + y_cell);

        if (e.type === 'mouseenter') {
            var x = e.pageX, y = e.pageY;
            targetDom.addClass('highlight-cell');

            if ($('#tooltip').length === 0) {
                $('body').prepend($('<div />').attr('id', 'tooltip'));
            }
            var tt = $('#tooltip').html("");
            var tooltipHeight = 100;

            var xBorder = x + tt.width() + 30;
            if (xBorder > $(window).width()) x -= (xBorder - $(window).width());

            var yBorder = y + tt.height() + 30;
            if (yBorder > $(window).height()) y -= (tooltipHeight * 2);

            if (back_cells.length >= 2) {
                $('#' + (back_cells[0] + 1) + '_' + (back_cells[1] + 1)).addClass('backtrace-highlight');
                if (back_cells.length === 4) $('#' + (back_cells[2] + 1) + '_' + (back_cells[3] + 1)).addClass('backtrace-highlight');
            }

            let text = `
                <p><label style='color: blue'> This cell is at (${x_cell},${y_cell}) with value ${this.innerHTML}</label><p>
                <p><label style='color: green'>Backpointer: (${(back_cells[0] + 1)},${(back_cells[1] + 1)})</p>
            `;

            let text2 = `
                <p><label style='color: blue'> This cell is at (${x_cell},${y_cell}) with value ${this.innerHTML}</label><p>
                <p><label style='color: green'>Backpointer: (${(back_cells[0] + 1)},${(back_cells[1] + 1)}) and 
                (${(back_cells[2] + 1)},${(back_cells[3] + 1)})</p>
            `;

            if (back_cells.length == 4) tt.append(text2); else if (back_cells.length == 2) tt.append(text);
            tt.css('left', x + 10);
            tt.css('color', "rgb(49, 17, 210)");
            tt.css('top', y + 10);
            tt.css('display', 'block');
        }
        if (e.type === 'mouseleave') {
            if (back_cells.length >= 2) {
                $('#' + (back_cells[0] + 1) + '_' + (back_cells[1] + 1)).removeClass('backtrace-highlight');
                if (back_cells.length === 4) $('#' + (back_cells[2] + 1) + '_' + (back_cells[3] + 1)).removeClass('backtrace-highlight');
            }
            targetDom.removeClass('highlight-cell');
            $('#tooltip').css('display', 'none');
        }
    });

    var fold = [];
    var path = [];
    var nussinov_table = [];
    var backpointers = [];

    function calculateNussinov() {
        if (document.getElementById('hairpin_length').value == '') return;
        const sequence = document.getElementById("rna_seq").value;
        if (sequence.length == 0) return;
        for (let i = 0; i < sequence.length; i++) {
            let key = sequence[i];
            if (!((key == 'A') || (key == 'U') || (key == 'G') || (key == "C"))) {
                document.getElementById("rna_seq").value = "";
                return;
            }
        }

        // Update the dot-parenthesis structure
        var numbers = document.getElementById("numbers");
        var letters = document.getElementById("letters");
        var asterisks = document.getElementById("asterisks");
        var d3graph = document.getElementById("visualization");

        while (numbers.hasChildNodes()) { numbers.removeChild(numbers.firstChild); }
        while (letters.hasChildNodes()) { letters.removeChild(letters.firstChild); }
        while (asterisks.hasChildNodes()) { asterisks.removeChild(asterisks.firstChild); }
        while (d3graph.hasChildNodes()) { d3graph.removeChild(d3graph.firstChild); }

        var count = 1;
        for (let i in sequence) {
            var elem1 = document.createElement("td"); elem1.textContent = count.toString();
            var elem2 = document.createElement("td"); elem2.textContent = sequence[i];
            var elem3 = document.createElement("td"); elem3.textContent = "*";
            numbers.appendChild(elem1);
            letters.appendChild(elem2);
            asterisks.appendChild(elem3);
            count += 1;
        }

        // Update the table
        var matrix = document.getElementById("matrixBody");
        while (matrix.hasChildNodes()) { matrix.removeChild(matrix.firstChild); }
        for (let i = 0; i < sequence.length + 1; i++) {
            var row = document.createElement("tr");
            if (i == 0) {
                var child = document.createElement("td"); child.textContent = "S";
                row.appendChild(child);
                for (let j = 0; j < sequence.length; j++) {
                    var col = document.createElement("td");
                    col.textContent = sequence[j];
                    col.id = i + "_" + (j+1);
                    col.style = 'color: purple';
                    row.appendChild(col);
                }
            } else {
                var col1 = document.createElement("td"); col1.textContent = sequence[i-1];
                col1.style = 'color: purple';
                row.appendChild(col1);
                for (let j = 0; j < sequence.length; j++) {
                    var col = document.createElement("td"); col.textContent = "0";
                    col.id = i + "_" + (j+1);
                    row.appendChild(col);
                }
            }
            matrix.appendChild(row);
        }

        // Calculate the table
        let hairpin_length = parseInt(document.getElementById("hairpin_length").value);
        [nussinov_table, backpointers] = nussinov(sequence, hairpin_length);

        // Set the values
        var table = document.getElementById("matrixTable");
        for (let i = 0; i < nussinov_table.length; i++) {
            for (let j = 0; j < nussinov_table[0].length; j++) {
                var cell = table.rows[i+1].cells[j+1];
                cell.textContent = nussinov_table[i][j];
            }
        }

        if (parseInt(nussinov_table[0][sequence.length - 1]) == 0) return;

        // Calculate the path for the optimal traceback
        [path, fold] = traceback(nussinov_table, sequence);

        // Highlight the optimal path red
        for (let idx in path) {
            $("#" + (path[idx][0]+1) + "_" + (path[idx][1]+1)).addClass("optimal-path-cell");
            // table.rows[path[idx][0]+1].cells[path[idx][1]+1].style = "background-color:rgb(212,108,108);";
        }

        // Calculate the dot-parenthesis structure
        var structure = dotpar(sequence, fold);

        // Update the structure
        for (let i = 0; i < structure.length; i++) {
            asterisks.cells[i].textContent = structure[i];
        }

        createForceGraph();
    }

    function createForceGraph() {

        var d3graph = document.getElementById("visualization");
        while (d3graph.hasChildNodes()) { d3graph.removeChild(d3graph.firstChild); }

        const sequence = document.getElementById("rna_seq").value;

        // Create JSON object for graph
        let json_node = [];
        json_node.push({
            id: "startnode",
            group: 2,
            label: "5'"
        });
        
        for (let i = 0; i < sequence.length; i++) {
            json_node.push({id: sequence[i] + i, 
                            group: 1, 
                            label: sequence[i]});
        }

        json_node.push({
            id: "endnode",
            group: 2,
            label: "3'"
        });

        let json_link = [];

        json_link.push({
            source: "startnode",
            target: sequence[0] + '0',
            value: parseInt(document.getElementById("regular_nucelotide_input").value), 
            group: "chain"
        });

        for (let i = 0, j = 1; j < sequence.length; i++, j++) {
            json_link.push({source: sequence[i] + i, 
                            target: sequence[j] + j, 
                            value: parseInt(document.getElementById("regular_nucelotide_input").value), 
                            group: "chain"});
        }
        for (let i = 0; i < fold.length; i++) {
            json_link.push({source: sequence[fold[i][0]] + fold[i][0], 
                            target: sequence[fold[i][1]] + fold[i][1], 
                            value: parseInt(document.getElementById("match_basepair_input").value),
                            group: "basepair"});
        }

        json_link.push({
            source: sequence[sequence.length - 1] + (sequence.length - 1),
            target: 'endnode',
            value: parseInt(document.getElementById("regular_nucelotide_input").value), 
            group: "chain"
        });

        let graph = {nodes: json_node, links: json_link};
        
        // Create the force-directed graph
        var svg = d3.select("svg"),
            width = svg.attr("width"),
            height = +svg.attr("height");

        var simulation = d3.forceSimulation(graph.nodes)
            .force("link", d3.forceLink(graph.links)
                .id(d => d.id).distance(d => d.value))
            .force("charge", d3.forceManyBody().strength(parseInt(document.getElementById("charge_input").value)))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg
            .selectAll('path.link')
            .data(graph.links)
            .enter()
            .append("path")
            .attr("class", "links")
            .attr("stroke", (d => d.group == "basepair" ? "red" : "black"))
            .attr("stroke-opacity", d => 2.6)
            .attr("stroke-width", d => 11)
            .attr("stroke-linecap", "round");

        const e = svg.selectAll("g")
                   .data(graph.nodes)
                   .enter()
                   .append("g");

        e.append("circle")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", 30)
            .attr("stroke", d => d.group == 2 ? "white" : "grey" )
            .attr("stroke-width", function (d) { return 3.5; })
            .attr("fill", d => d.group == 2 ? "white" : "palegreen")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
        e.append("title")
                .text(function(d) { return d.id; });
        e.append("text")
                .attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; })
                .attr("dx", function(d){return 0;})
                .attr("dy", function(d) {return 10;})
                .text(function (b) {
                    return b.label;
                })
                .attr("text-anchor", "middle")
                .attr("font-size", 30)
                .attr("font-weight", "bold")
                .attr("y", 2.5)
                .attr("class", "node-label");

        svg.call(d3.zoom().on("zoom", function () {
            e.attr("transform", d3.event.transform);
            link.attr("transform", d3.event.transform);
        }));

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        const lineGenerator = d3.line();

        function ticked() {
            link.attr('d', d => lineGenerator([
                [d.source.x, d.source.y], 
                [d.target.x, d.target.y]]));

            e.selectAll("circle")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
            e.selectAll("text")
                .attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });
        }

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    function isEqual(tuple1, tuple2) {
        return tuple1.length === tuple2.length && tuple1.every((element, index) => element === tuple2[index]);
    }

    function canFormBasePair(base1, base2) {
        return (base1 === 'A' && base2 === 'U') ||
               (base1 === 'U' && base2 === 'A') ||
               (base1 === 'G' && base2 === 'C') ||
               (base1 === 'C' && base2 === 'G');
    }

    function nussinov(seq, hairpin_length) {
        const n = seq.length;
        var table = new Array(n);
        var backpointers = new Array(n);
        for (let i = 0; i < n; i++) {
            table[i] = new Array(n).fill(0);
            backpointers[i] = new Array(n).fill(-1);
        }
    
        let i = 0;
        let j = 1;
        let prev_j = 1;
        while (!isEqual([i, j], [0, n])) {
            let possible = [];
            if (i + hairpin_length >= j) {
                possible.push(0);
            }

            if ((i + hairpin_length < j) && canFormBasePair(seq[i], seq[j])) {
                possible.push(parseInt(table[i+1][j-1]) + 1);
            }

            if ((i + hairpin_length < j) && !canFormBasePair(seq[i], seq[j])) {
                possible.push(parseInt(table[i+1][j-1]));
            }

            if (i + hairpin_length < j) {
                possible.push(parseInt(table[i+1][j]));
                let max_k = 0;
                for (let k = i; k < j; k++) {
                    max_k = Math.max(max_k, parseInt(table[i][k]) + parseInt(table[k+1][j]));
                }
                possible.push(max_k);
            }

            table[i][j] = Math.max(...possible);
            if (table[i][j] == 0) {
                backpointers[i][j] = -1;
            } else if (table[i][j] == parseInt(table[i+1][j])) {
                backpointers[i][j] = [i+1, j];
            } else if (table[i][j] == parseInt(table[i][j-1])) {
                backpointers[i][j] = [i, j-1];
            } else if (table[i][j] == parseInt(table[i+1][j-1]) + 1) {
                backpointers[i][j] = [i+1, j-1];
            } else if (table[i][j] == parseInt(table[i+1][j-1])) {
                backpointers[i][j] = [i+1, j-1];
            } else {
                for (let k = i; k < j; k++) {
                    if (table[i][j] == parseInt(table[i][k]) + parseInt(table[k+1][j])) {
                    backpointers[i][j] = [i, k, k+1, j];
                    break;
                    }
                }
            }
            i++;
            j++;

            if (j > n - 1) {
                i = 0;
                prev_j++;
                j = prev_j;
            }
        }
        return [table, backpointers];
    }

    function dotpar(sequence, path) {
        const structure = new Array(sequence.length).fill('-');
        for (let pair = 0; pair < path.length; pair++) {
            structure[Math.min(...path[pair])] = '(';
            structure[Math.max(...path[pair])] = ')';
        }
        return structure;
    }

    function traceback(table, sequence) {
        const ret = [], fold = [];
        const stack = [];
        stack.push([0, sequence.length - 1]);
        
        while (stack.length > 0) {
            const [i, j] = stack.pop();
            if ((i === j + 1) && (i === table.length - 1)) continue;
            if (i > j+1) continue;
            else if (table[i+1][j] === table[i][j]) {
                ret.push([i, j]);
                stack.push([i+1, j]);
            } else if (table[i][j-1] === table[i][j]) {
                ret.push([i, j]);
                stack.push([i, j-1]);
            } else if ((table[i+1][j-1] + 1 === table[i][j]) && canFormBasePair(sequence[i], sequence[j])) {
                ret.push([i, j]);
                fold.push([i, j]);
                stack.push([i+1, j-1]);
            } else {
                for (let k = i+1; k < j; k++) {
                    if (table[i][k] + table[k+1][j] === table[i][j]) {
                        ret.push([i, j]);
                        stack.push([k+1, j]);
                        stack.push([i, k]);
                        break;
                    }
                }
            }
        }
        return [ret, fold];
    }
});