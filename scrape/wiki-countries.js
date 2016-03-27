$('.wikitable.sortable tbody tr td:first-child a:first-child').each(function(index, node){
    var url = 'https://en.wikipedia.org' + $(node).attr('href');
    phantomScraper.addJob(url,  'scrape/wiki-country.js');
});
