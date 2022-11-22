$(document).ready(function(){
    const input = document.getElementById('rna_seq');

    input.addEventListener('keypress', function inputKeypressHandler(e) {
        const key = e.key;
        if (!((key == 'A') || (key == 'U') || (key == 'G') || (key == "C"))) {
            e.preventDefault();
        }
    });

    input.addEventListener('keyup', function inputKeyupHandler(e) {
        // Update the dot-parenthesis structure
        var numbers = document.getElementById("numbers");
        var letters = document.getElementById("letters");
        var asterisks = document.getElementById("asterisks");
        document.getElementById("invalid_input").textContent = "Log: got here";

        while (numbers.hasChildNodes()) { numbers.removeChild(numbers.firstChild); }
        while (letters.hasChildNodes()) { letters.removeChild(letters.firstChild); }
        while (asterisks.hasChildNodes()) { asterisks.removeChild(asterisks.firstChild); }

        const sequence = document.getElementById("rna_seq").value;
        console.log(sequence);
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
                var appendedSequence = " " + sequence;
                for (let j = 0; j < appendedSequence.length; j++) {
                    var col = document.createElement("td");
                    col.textContent = appendedSequence[j];
                    row.appendChild(col);
                }
            } else {
                var col1 = document.createElement("td"); col1.textContent = sequence[i-1];
                row.appendChild(col1);
                for (let j = 0; j < sequence.length + 1; j++) {
                    var col = document.createElement("td"); col.textContent = "0";
                    row.appendChild(col);
                }
            }
            matrix.appendChild(row);
        }

        // Calculate the table
    });
});