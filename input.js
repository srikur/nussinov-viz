$(document).ready(function(){
    const input = document.getElementById('rna_seq');

    input.addEventListener('keypress', function inputKeypressHandler(e) {
        const key = e.key;
        if (!((key == 'A') || (key == 'U') || (key == 'G') || (key == "C"))) {
            e.preventDefault();
        }
    });

    input.addEventListener('keyup', function inputKeyupHandler(e) {

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

        while (numbers.hasChildNodes()) { numbers.removeChild(numbers.firstChild); }
        while (letters.hasChildNodes()) { letters.removeChild(letters.firstChild); }
        while (asterisks.hasChildNodes()) { asterisks.removeChild(asterisks.firstChild); }

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
                    row.appendChild(col);
                }
            } else {
                var col1 = document.createElement("td"); col1.textContent = sequence[i-1];
                row.appendChild(col1);
                for (let j = 0; j < sequence.length; j++) {
                    var col = document.createElement("td"); col.textContent = "0";
                    row.appendChild(col);
                }
            }
            matrix.appendChild(row);
        }

        // Calculate the table
        var nussinov_table = nussinov(sequence, 0);

        // Set the values
        var table = document.getElementById("matrixTable");
        for (let i = 0; i < nussinov_table.length; i++) {
            for (let j = 0; j < nussinov_table[0].length; j++) {
                var cell = table.rows[i+1].cells[j+1];
                cell.textContent = nussinov_table[i][j];
            }
        }

        // Calculate the path for the optimal traceback
        var [path, fold] = traceback(nussinov_table, sequence);

        // Calculate the dot-parenthesis structure
        var structure = dotpar(sequence, fold);
        console.log(structure);

        // Update the structure
        for (let i = 0; i < structure.length; i++) {
            asterisks.cells[i].textContent = structure[i];
        }
    });

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
        for (let i = 0; i < n; i++) {
            table[i] = new Array(n).fill(0);
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
            i++;
            j++;

            if (j > n - 1) {
                i = 0;
                prev_j++;
                j = prev_j;
            }
        }
        return table;
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
            if (i > j) continue;
            else if (table[i+1][j-1] + 1 === table[i][j]) {
                ret.push([i, j]);
                fold.push([i, j]);
                stack.push([i+1, j-1]);
            } else if (table[i+1][j-1] === table[i][j]) {
                ret.push([i, j]);
                stack.push([i+1, j-1]);
            } else if (table[i+1][j] === table[i][j]) {
                ret.push([i, j]);
                stack.push([i+1, j]);
            } else if (table[i][j-1] === table[i][j]) {
                ret.push([i, j]);
                stack.push([i, j-1]);
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