// generate a "Raw Searcher" to handle search queries
google.load('search', '1');

var DEFAULT_IMG_URL = 'http://news.livedoor.com/img/fb/news.png?v=20131122';
var DEFAULT_RELATED_IMG_URL = 'img/google_news.jpg';

var currentArticles = [];

function checkAddToCurrrentArticles(link) {
    if ($.inArray(link, currentArticles) > -1) return false;
    currentArticles.push(link);
    return true;
}

function buildRelatedArticle(article) {
    var html = "<div class='col-xs-4'>";
    var content = "";
    var imageUrl = (('image' in article) ? article.image.url : DEFAULT_RELATED_IMG_URL);

    content = "\
<div class='row'>\
    <div class='col-xs-12 feed-related-img-div'>\
        <img src='" + imageUrl + "' alt='' class='img-responsive center-block'/>\
    </div>\
<div class='col-xs-12'>\
    <a class='text-info related-article-url' href='" + article.unescapedUrl + "'>" + article.titleNoFormatting + "</a>\
</div>\
</div>";

    html += (content + "</div>");
    return html;
}

// add a news item into the feed
function feedAdder(entry) {
    // build
    var mainArticle = "\
    <div class='col-xs-12 main-article-container'>\
    <div class='col-xs-4 feed-img-div'>";
    var imageUrl = ((entry.imgUrl !== undefined) ? entry.imgUrl : DEFAULT_IMG_URL);
    mainArticle += "<img src='" + imageUrl + "' alt='' class='img-responsive main-article-img center-block'/>";
    mainArticle += "\
    </div>\
    <div class='col-xs-8'>\
        <strong>" + entry.title + "</strong>\
        <p class='text-muted'>" + entry.contentSnippet + "</p>\
    </div>\
    </div>";
    var relatedArticles = "\
    <div class='col-xs-12 related-article-container'>";
    var addedCount = 0;
    for (var i = 0; i < entry.relatedArticles.length; i++) {
        if (checkAddToCurrrentArticles(entry.relatedArticles[i].unescapedUrl)) {
            relatedArticles += buildRelatedArticle(entry.relatedArticles[i]);
            addedCount++;
            if (addedCount >= 3) break;
        }
    }
    relatedArticles += "\
</div>";

    // append
    $('<div/>', {
        id: 'foo',
        href: 'http://google.com',
        'class': 'col-xs-12 col-md-6 panel panel-default',
        html: mainArticle + relatedArticles
    }).appendTo('#main-feed');
}

function newsSearchComplete(newsSearch, entry) {
    // console.log(newsSearch.results);
    entry.relatedArticles = newsSearch.results;
    feedAdder(entry);
}

function getRelated(entry) {
    // Create a News Search instance.
    var newsSearch = new google.search.NewsSearch();

    // Set newsSearchComplete as the callback function when a search is
    // complete.  The newsSearch object will have results in it.
    newsSearch.setResultSetSize(8);
    newsSearch.setSearchCompleteCallback(this, newsSearchComplete, [newsSearch, entry]);

    // Specify search quer(ies)
    var hitWords = getHitWords(entry.articleBody);
    // var hitWords = getHitWords(entry.title);

    // newsSearch.execute(entry.title);
    var query = hitWords.join(' ');
    console.log(entry.title + ": " + query);
    newsSearch.execute(query);
}

// Retrieve the details of the news item, jquery.xdomainajax is necessary
function getDetails(entry) {
    $.ajax({
        url: entry.link,
        type: 'GET',
        success: function(res) {
            // add the details to the entry object
            entry.articleBody = $(res.responseText).find('div.articleBody:first').text();
            entry.imgUrl = $(res.responseText).find('figure.articleImage:first').find('img:first').prop('src');
            if (entry.articleBody.length > 0) {
                getRelated(entry);
            }
        }
    });
}

function showFeed(feed) {
    $('#title').html(feed.description);
    for (var i in feed.entries) {
        console.log(feed.entries[i]);
        if (checkAddToCurrrentArticles(feed.entries[i].link)) {
            getDetails(feed.entries[i]);
        }
    }
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
