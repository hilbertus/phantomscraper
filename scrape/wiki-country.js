var data = {
    'name': $('#firstHeading').html(),
    'latitude' : $('.geo-dms .latitude').html(),
    'longitude' : $('.geo-dms .longitude').html()
};

phantomScraper.addData(data);