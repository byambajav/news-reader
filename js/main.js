// Retrieve the details of the news item
function getDetails(data, callback) {
    $.ajax({
        url: data.link,
        type: 'GET',
        success: function(res) {
            var img_url = $(res.responseText).find('figure.articleImage:first').find('img:first').prop('src');
            callback(data, img_url);
        }
    });
}

function feedAppender(data, img_url) {
    var DEFAULT_URL = 'http://news.livedoor.com/img/fb/news.png?v=20131122';
    var html = "\
<div class='col-xs-12 panel panel-default'>\
        <div class='row'>\
             <div class='col-xs-4'>";
    if (typeof img_url !== 'undefined') {
        html += "<img src='" + img_url + "' alt='' class='img-responsive' />";
    } else {
        html += "<img src='" + DEFAULT_URL + "' alt='' class='img-responsive' />";
    }
    html += "\
            </div>\
            <div class='col-xs-8'>\
                <strong>" + data.title + "</strong>\
                <p class='text-muted'>" + data.contentSnippet + "</p>\
            </div>\
        </div>\
</div>";
    $('<div/>', {
        id: 'foo',
        href: 'http://google.com',
        'class': 'col-xs-12 col-md-6',
        /* html: '<h3>' + data.entries[i].title + '</h3>' */
        html: html
    }).appendTo('#main-feed');
}

function renderNews(data) {
    $('#title').html(data.description);
    for (i in data.entries) {
        getDetails(data.entries[i], feedAppender);
    }
    console.log(data);
}
function parseRSS(url, callback) {
    $.ajax({
        url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(url),
        dataType: 'json',
        success: function(data) {
            callback(data.responseData.feed);
        }
    });
}
