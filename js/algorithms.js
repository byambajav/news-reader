function getHitWords(doc) {
    var segmenter = new TinySegmenter();
    var words = segmenter.segment(doc.replace(/ /g,'').replace(/　/g,''));
    var basics = ['から', 'ない', 'した', 'する', 'して', 'よう', 'こと', 'たち', 'いる', 'いた', 'など', 'という', 'より', 'ます', 'たい', '↵↵', 'ため'];

    // build a dict object
    var dict = {};
    for (var i in words) {
        if (words[i].length > 1 && ($.inArray(words[i], basics) == -1)) {
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

    console.log(tuples);
    return tuples.slice(0, 8);
};
