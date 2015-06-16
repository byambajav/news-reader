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

function buildRelatedArticle(article, pos) {
    var html;
    if (pos == 1) {
        html = "<div class='col-xs-4 related-article-middle'>";
    } else {
        html = "<div class='col-xs-4'>";
    }
    var content = "";
    var imageUrl = (('image' in article) ? article.image.url : DEFAULT_RELATED_IMG_URL);

    content = "\
<div class='row'>\
    <div class='col-xs-12 related-article-img-div'>\
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
    // main article
    var mainArticle = "\
    <div class='col-xs-12 main-article-container' data-toggle='modal' data-target='#modal-" + entry.index + "'>\
    <div class='col-xs-4 feed-img-div'>";
    var imageUrl = ((entry.imgUrl !== undefined) ? entry.imgUrl : DEFAULT_IMG_URL);
    mainArticle += "<img src='" + imageUrl + "' alt='' class='img-responsive main-article-img center-block'/>";
    mainArticle += "\
    </div>\
    <div class='col-xs-8'>\
        <strong>" + entry.title + "</strong>\
        <p class='text-muted'>" + entry.contentSnippet +
       "<small class='text-muted text-right'> /" + moment(Date.parse(entry.publishedDate)).fromNow() + "</small></p>\
    </div>\
    </div>";

    // related articles
    var relatedArticles = "\
    <div class='col-xs-12 related-article-container'>";
    var addedCount = 0;
    for (var i = 0; i < entry.relatedArticles.length; i++) {
        if (checkAddToCurrrentArticles(entry.relatedArticles[i].unescapedUrl)) {
            relatedArticles += buildRelatedArticle(entry.relatedArticles[i], addedCount);
            addedCount++;
            if (addedCount >= 3) break;
        }
    }
    relatedArticles += "\
</div>";

    // insert main article and related articles to the holder
    $('#article-' + entry.index).html(mainArticle + relatedArticles);

    // modal
    var modal = "\
    <div class='modal-dialog modal-reader'>\
        <div class='modal-content'>\
            <div class='modal-header'>\
                <button type='button' class='close' data-dismiss='modal'>&times;</button>\
                <h4 class='modal-title'>" + entry.title + "</h4>\
            </div>\
            <div class='modal-body'>"
                 + entry.articleBodyHtml +
            "</div>\
            <div class='modal-footer'>\
                <a href='" + entry.link + "' class='modal-source'>source<a/>\
                <button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>\
            </div>\
        </div>\
</div>";

    // append modal to the modals-holder
    $('<div/>', {
        id: 'modal-' + entry.index,
        'class': 'modal fade',
        role: 'dialog',
        html: modal
    }).appendTo('#modals-holder');
}

function newsSearchComplete(newsSearch, entry) {
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
            entry.articleBodyHtml = $(res.responseText).find('div.articleBody:first').html();
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
        feed.entries[i].index = i;
        if (checkAddToCurrrentArticles(feed.entries[i].link)) {
            // append main article and related articles holder to the main feed
            $('<div/>', {
                id: 'article-' + i,
                'class': 'col-xs-12 col-md-6'
            }).appendTo('#main-feed');

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
