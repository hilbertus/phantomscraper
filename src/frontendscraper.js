function FrontendPhantomScraper() {
    this._jobs = [];
    this._data = [];

    this.addJob = function (url, scrapeFile) {
        this._jobs.push({'url': url, 'file': scrapeFile});
    }

    this.addData = function(data){
        this._data.push(data);
    }

    this.getResult = function(){
        return {'jobs': this._jobs, 'data': this._data};
    }
}

var phantomScraper = new FrontendPhantomScraper();

