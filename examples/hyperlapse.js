var ItunesAppReviews = require('../');
var iTunesAppReviews = new ItunesAppReviews();

iTunesAppReviews.getReviews('740146917', 'us');

iTunesAppReviews.on('data', function(review) {
  // custom template
  var options = {
    template: {
      header: '{title} total: {summary.total}{sepalator}',
      entry: '{entry.rating.icon} by {entry.author}{sepalator}'
    }
  };
  console.log(iTunesAppReviews.report(review, options));
});

iTunesAppReviews.on('error', function(err) {
  console.error('failed to get reviews', err);
});
