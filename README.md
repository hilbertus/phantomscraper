# phantomscraper
Scrape your data like you would do it with the help of jQuery in browsers console. 
This means pages with dynamic content are no longer a problem. It is up to you to transfer the data in desired formats 
or collect the data for later processing. 

## Install
1. Download or clone phantomscraper
2. Download [PhantomJS](http://phantomjs.org/) (put the binary in /bin)

## Get started

### Scrape data from single page

As an example, we try to scrape the geo data of a country from a wiki page.

Create _wiki-country.js_ in _/scrape_ dir with following code
```javascript
var data = {
    'name': $('#firstHeading').html(),
    'latitude' : $('.geo-dms .latitude').html(),
    'longitude' : $('.geo-dms .longitude').html()
};

phantomScraper.addData(data);
```

Run `bin/phantomjs index.js "https://en.wikipedia.org/wiki/Germany" "scrape/wiki-country.js"`.

Now look in _/out/data.js_. Hopefully you now see the following json content
```javascript
[
{
	"latitude": "51°N",
	"longitude": "9°E",
	"name": "Germany"
}
]
```

That's all. In your _wiki-country.js_ file you collect the data and give 
them to phantomScraper with `phantomScraper.addData(data)`. Of course you can invoke `phantomScraper.addData(data)` 
repeatedly with different data.


### Scrape data from several pages

You will see, collecting data from several pages is almost the same.
We try to scrape the geo data from all countries.

Create _wiki-countries.js_ in _/scrape_ dir with following code
```javascript
$('.wikitable.sortable tbody tr td:first-child a:first-child').each(function(index, node){
    var url = 'https://en.wikipedia.org' + $(node).attr('href');
    phantomScraper.addJob(url,  'scrape/wiki-country.js');
});
```

run `bin/phantomjs index.js "https://en.wikipedia.org/wiki/ISO_3166-1" "scrape/wiki-countries.js"`.

It will take a while but when it's done, look again in _/out/data.js_.

The most important part here is the command `phantomScraper.addJob(url,  'scrape/wiki-country.js')`. 
When phantomscraper is done with the current scrape job, it just makes the next one. That means calling
`phantomScraper.addJob(url,  'scrape/wiki-country.js')` is almost the same as calling 
`bin/phantomjs index.js "https://en.wikipedia.org/wiki/Germany" "scrape/wiki-country.js"` for each country in the list 
of [ISO_3166-1](https://en.wikipedia.org/wiki/ISO_3166-1).

Phantomscraper will add an url only once. You don't need to think about phantomscraper will scrape a page several times. 

## How it works

When you call `bin/phantomjs index.js <url> <your javascript>` phantomscraper will open your `<url>` in PhantomJs. 
Then it 

1. injects jQuery from `libs/jquery-2.2.2.min.js`, so you can use jQuery
2. injects phantomscraper from `src/frontendscraper.js`, so you can use `phantomScraper.addData(data)` and `phantomScraper.addJob(url,  'your other scripts')`
3. injects your script `<your javascript>`
4. injects code to collect data and further jobs you added to `phantomscraper`

Because of this sequence of injected scripts, you should avoid working with asynchronous commands. It may otherwise be 
that the data are collected (step 4.) before your asynchronous process is finished.


## [License](LICENSE)