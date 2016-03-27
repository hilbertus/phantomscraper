/**
 * run with e.g bin\phantomjs.exe index.js "https://en.wikipedia.org/wiki/ISO_3166-1" "scrape/wiki-countries.js"
 * @type {Object}
 */

var page = require('webpage').create();
var system = require('system');
var fs = require('fs');

/* ========================================= init =================================================================== */
if (system.args.length < 3) {
    console.log('Help');
    console.log('call: phantomjs.exe index.js <url> <script>');
    console.log("\t<url> the url where to start the scraping job");
    console.log("\t<script> urls corresponding scraping script");
    phantom.exit();
}

/* ========================================= helper ================================================================= */
function JsonArrayFile(path) {
    this._fileStream = fs.open(path, {
        mode: 'w',
        charset: 'UTF-8'
    });
    this._counterWrittenObjects = 0;

    this._init = function () {
        this._fileStream.write('[\n');
    };

    this.addData = function (json) {
        if (this._counterWrittenObjects > 0) {
            this._fileStream.write(',\n');
        }
        this._fileStream.write(JSON.stringify(json, null, '\t'));
        this._counterWrittenObjects++;
    };


    this.close = function () {
        this._fileStream.write('\n]');
        this._fileStream.close();
    };

    this._init();
}

/* =========================================== core ================================================================= */

function ScrapingJob() {
    this.url = null;
    this.file = null;
};


function ScrapingBuffer() {

    this._jobBuffer = [];
    this._jobKey = {};
    this._counterTakenJobs = 0;
    this._dataFile = new JsonArrayFile('out/data.json');
    this._errorFile = new JsonArrayFile('out/error.json');

    this.addJob = function (scrapingJob) {
        if (this._jobKey.hasOwnProperty(scrapingJob.url)) {
            return null;
        }
        this._jobBuffer.push(scrapingJob);
        this._jobKey[scrapingJob.url] = null;
    };

    this._getNextJobTillFinish = function () {
        var job = this._jobBuffer.shift();
        if (job === undefined) {
            this._finish();
        }
        this._counterTakenJobs++;
        return job;
    };

    this._finish = function () {
        this._dataFile.close();
        this._errorFile.close();
        phantom.exit();
    }

    this._addFailedJob = function (job, errorMsg) {
        job.error = errorMsg;
        this._errorFile.addData(job);
    };

    this._addScrapedDate = function (data) {
        for (var i in data) {
            this._dataFile.addData(data[i]);
        }
    }

    this._scrapeFromBuffer = function () {
        var self = this;
        var job = self._getNextJobTillFinish();
        self._printStatus();
        page.open(job.url, function (status) {
            if (status !== "success") {
                self._addFailedJob(job, 'Could not open ' + job.url);
                self._scrapeFromBuffer();
            }
            if (!page.injectJs('libs/jquery-2.2.2.min.js')) {
                self._addFailedJob(job, 'Could not inject jQuery');
                self._scrapeFromBuffer();
            }
            if (!page.injectJs('src/frontendscraper.js')) {
                self._addFailedJob(job, 'Could not inject src/frontendscraper.js');
                self._scrapeFromBuffer();
            }
            if (!page.injectJs(job.file)) {
                self._addFailedJob(job, 'Could not inject ' + job.file);
                self._scrapeFromBuffer();
            }
            var scrapedResult = page.evaluate(function () {
                return phantomScraper.getResult();
            });

            self._addJobs(scrapedResult.jobs);
            self._addScrapedDate(scrapedResult.data);
            self._scrapeFromBuffer();
        });
    };

    this._printStatus = function () {
        console.log(this._jobBuffer.length + '\t --> \t' + this._counterTakenJobs);
    };

    this._addJobs = function (jobs) {
        for (var i in jobs) {
            this.addJob(jobs[i]);
        }
    };

    this.start = function () {
        this._scrapeFromBuffer();
    }
};

/* ============================================ run ================================================================= */
var entryPoint = new ScrapingJob();
entryPoint.url = system.args[1];
entryPoint.file = system.args[2];

var scrapingBuffer = new ScrapingBuffer();
scrapingBuffer.addJob(entryPoint);
scrapingBuffer.start();