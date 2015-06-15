// generate a "Raw Searcher" to handle search queries
google.load('search', '1');

// add a news item into the feed
function feedAdder(entry) {
    // build
    var DEFAULT_IMG_URL = 'http://news.livedoor.com/img/fb/news.png?v=20131122';
    var html = "\
<div class='col-xs-12 panel panel-default'>\
             <div class='col-xs-4 main-feed-img'>";
    if (typeof entry.imgUrl !== 'undefined') {
        html += "<img src='" + entry.imgUrl + "' alt='' class='img-responsive' />";
    } else {
        html += "<img src='" + DEFAULT_IMG_URL + "' alt='' class='img-responsive' />";
    }
    html += "\
            </div>\
            <div class='col-xs-8'>\
                <strong>" + entry.title + "</strong>\
                <p class='text-muted'>" + entry.contentSnippet + "</p>\
            </div>\
</div>";

    // append
    $('<div/>', {
        id: 'foo',
        href: 'http://google.com',
        'class': 'col-xs-12 col-md-6',
        /* html: '<h3>' + data.entries[i].title + '</h3>' */
        html: html
    }).appendTo('#main-feed');
}

function newsSearchComplete(newsSearch, entry) {
    feedAdder(entry);

    // Check that we got results
    if (newsSearch.results && newsSearch.results.length > 0) {
        for (var i = 0; i < newsSearch.results.length; i++) {
            // console.log(newsSearch.results[i]);
            // Create HTML elements for search results
            var p = document.createElement('p');
            var a = document.createElement('a');
            a.href = newsSearch.results[i].unescapedUrl;
            a.innerHTML = newsSearch.results[i].title;

            // Append search results to the HTML nodes
            p.appendChild(a);
            // document.body.appendChild(p);
            $('#main-feed').append(p);
        }
    }
}

function getRelated(entry) {
    // Create a News Search instance.
    var newsSearch = new google.search.NewsSearch();

    // Set newsSearchComplete as the callback function when a search is
    // complete.  The newsSearch object will have results in it.
    newsSearch.setSearchCompleteCallback(this, newsSearchComplete, [newsSearch, entry]);

    // Specify search quer(ies)
    // console.log(entry.articleBody);
    var hitWords = getHitWords(entry.articleBody);

    // newsSearch.execute(entry.title);
    newsSearch.execute(hitWords.join(' '));
}

// Retrieve the details of the news item, jquery.xdomainajax is necessary
function getDetails(entry) {
    $.ajax({
        url: entry.link,
        type: 'GET',
        success: function(res) {
            // add the details to the entry
            entry.articleBody = $(res.responseText).find('div.articleBody:first').text();
            entry.imgUrl = $(res.responseText).find('figure.articleImage:first').find('img:first').prop('src');
            getRelated(entry);
        }
    });
}

function showFeed(feed) {
    $('#title').html(feed.description);
    for (var i in feed.entries) {
        getDetails(feed.entries[i]);
    }
    // console.log(feed);
}

function showFeedFromUrl(url) {
    $.ajax({
        url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(url),
        dataType: 'json',
        success: function(data) {
            showFeed(data.responseData.feed);
        }
    });
}
