function getHitWords(doc) {
    var segmenter = new TinySegmenter();
    var words = segmenter.segment(doc.replace(/ /g,'').replace(/↵/g,'').replace(/\n/g,''));
    console.log(words);
    var basics = ['から', 'ない', 'した', 'する', 'して', 'よう', 'こと', 'たち', 'いる', 'いた', 'など', 'という', 'より', 'ます', 'たい', 'ため', 'まで', 'です'];

    // build a dict object
    var dict = {};
    for (var i in words) {
        if (words[i].length > 1 && ($.inArray(words[i], basics) == -1) && words[i].slice(-1) !== 'っ') {
            if (words[i] in dict) {
                dict[words[i]] += 1;
            } else {
                dict[words[i]] = 1;
            }
        }
    }

    // convert it into an array
    var tuples = [];
    for (var key in dict) tuples.push([key, dict[key]]);
    tuples.sort(function (a, b) { return b[1] - a[1]; });

    var out = [];
    for (var j = 0; j < Math.min(tuples.length, 5); j++) {
        out.push(tuples[j][0]);
    }
    return out;
    // console.log(tuples);
    // return tuples.slice(0, 8);
};
