var ItunesAppReviews = require('../');
var iTunesAppReviews = new ItunesAppReviews();

var date = new Date();
var yesterday = date.setDate(date.getDate() - 1);

iTunesAppReviews.getReviews('333903271', 'jp');

iTunesAppReviews.on('data', function(review) {
  console.log(iTunesAppReviews.filterByDate(review, yesterday)); // return yesterday's reviews
  console.log(iTunesAppReviews.filterByVersion(review, '6.20')); // return version 6.20's reviews
  console.log(iTunesAppReviews.summarize(review)); // return summary object
  console.log(iTunesAppReviews.report(review)); // return text to report
});

iTunesAppReviews.on('error', function(err) {
  console.error('failed to get reviews', err);
});
