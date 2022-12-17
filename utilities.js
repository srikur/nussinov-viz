$(document).ready(function(){

    // JavaScript function
    function nussinov(seq) {
        let table = [];
        for (let i = 0; i < seq.length; i++) {
            table[i] = [];
            for (let j = 0; j < seq.length; j++) {
                table[i][j] = 0;
            }
        }
    
        let i = 0;
        let j = 1;
        let prev_j = 1;
        while (i !== 0 || j !== seq.length) {
        let possible = [];
        if (i + hairpin_length >= j) {
            possible.push(0);
        }
        if (i + hairpin_length < j && (seq[i], seq[j]) in base_pairs) {
            possible.push(table[i+1][j-1] + 1);
        }
        if (i + hairpin_length < j && !((seq[i], seq[j]) in base_pairs)) {
            possible.push(table[i+1][j-1]);
        }
        if (i + hairpin_length < j) {
            possible.push(table[i+1][j]);
            let max_k = 0;
            for (let k = i; k < j; k++) {
                max_k = Math.max(max_k, table[i][k] + table[k+1][j]);
            }
            possible.push(max_k);
        }
        table[i][j] = Math.max(...possible);
        i++;
        j++;
        if (j > seq.length - 1) {
            i = 0;
            prev_j++;
            j = prev_j;
        }
        }
        return table;
    }
  
});