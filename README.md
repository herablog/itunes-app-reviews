# iTunes App Reviews
This module provides you to get the user reviews of your iOS app.

## Install
Install with npm.

```
$ npm install itunes-app-reviews
```

## Usuage
The `getReviews()` function returns the reviews of your app.

- `app id` Your App ID on iTunes (Required)
- `country` two strings country name such as 'us', 'ch', 'it' and 'jp'
- `limit page number` Normally the iTunes API returns 50 items per 1 page

```JavaScript
var ItunesAppReviews = require('itunes-app-reviews');
var iTunesAppReviews = new ItunesAppReviews();

// Your App ID, country, limit page number
iTunesAppReviews.getReviews('740146917', 'us', 1);

// success
iTunesAppReviews.on('data', function(review) {
  console.log(review);
});

// failure
iTunesAppReviews.on('error', function(err) {
  console.log(err);
});
```

Notice: Sometimes iTunes API returns no data.


You're able to filter the reviews by date or the app version with the 'filterByDate()' and  the 'filterByVersion()' functions.

```JavaScript
var ItunesAppReviews = require('itunes-app-reviews');
var iTunesAppReviews = new ItunesAppReviews();

// Your App ID, country, limit page number
iTunesAppReviews.getReviews('740146917', 'us', 1);

// success
iTunesAppReviews.on('data', function(review) {
  console.log(iTunesAppReviews.filterByDate(review, '2015-01-27'));
  console.log(iTunesAppReviews.filterByVersion(review, '1.1.3'));
});
```

Notice: You might not be able to get any items, if the older date or version was selected. The iTunes API has only 500 items.


To report user reviews, use the `report()` function.

- data {array} review data (Required)
- options {object} optional object
  - sepalator {string} break word string like '\n' and '<br>'
  - day {string} day string added to header
  - template.header {string} template string
  - template.entry {string} template string

```JavaScript
var ItunesAppReviews = require('itunes-app-reviews');
var iTunesAppReviews = new ItunesAppReviews();

// Your App ID, country, limit page number
iTunesAppReviews.getReviews('740146917', 'us', 1);

// success
iTunesAppReviews.on('data', function(review) {
  iTunesAppReviews.report(review);
});
```

You can customize the template.

```JavaScript
// success
iTunesAppReviews.on('data', function(review) {
  var options = {
    template: {
      header: '{title} total: {summary.total}{sepalator}',
      entry: '{entry.rating.icon} by {entry.author}{sepalator}'
    }
  };
  console.log(iTunesAppReviews.report(review, options));
});
```

returns:
```

```

#### header
Default template:
```
{title} {day}{sepalator}
total:{summary.total} avg:{summary.average}{sepalator}
{icon.s1} {summary.rating.s1} {icon.s2} {summary.rating.s2} {icon.s3} {summary.rating.s3} {icon.s4} {summary.rating.s4} {icon.s5} {summary.rating.s5}{sepalator}
{sepalator}
```

Output:
```
iTunes Review Report 2015-01-27
total:50 avg:3.92
★ 3 ★★ 6 ★★★ 8 ★★★★ 8 ★★★★★ 25

```

#### entry
Default template:
```
{entry.title} by {entry.author}{sepalator}
{entry.rating.icon}{sepalator}
{entry.comment}{sepalator}
{entry.updated} {entry.version}{sepalator}
{sepalator}
```

Output:
```
Great by Huntershdgj
★★★★★
I love it great wonderful app
2015-01-27 7:59:00 AM v1.1.3

Totally awesome! by catshive
★★★★★
Fixes shakes in my videos so well!
2015-01-26 4:34:00 AM v1.1.3

```
