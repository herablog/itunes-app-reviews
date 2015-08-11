// load modules
var EventEmitter = require('events').EventEmitter;
var Util = require('util');
var _ = require('lodash');
var request = require('request');
var async = require('async');
var dateformat = require('dateformat');
var xml2js = require('xml2js').parseString;
var interpolate = require('interpolate');

// inherit EventEmitter
Util.inherits(ITunesAppReview, EventEmitter);
function ITunesAppReview() {
  EventEmitter.call(this);
}

/**
 * get reviews
 * @param {string} App Id (required)
 * @param {string} country shortcut ex.) us, it, ch, jp...
 * @param {number} limit number to access, 50 reviews is included/page (default: 1)
**/
ITunesAppReview.prototype.getReviews = function(appId, country, limit) {
  if (!appId) return false;
  country = country || 'us';
  limit = limit || 1;
  var self = this;

	async.times(limit, function(n, next) {
		var num = ++n;
		doRequest(num, function(err, data) {
			next(err, data);
		});
	}, function(err, result) {
		if (err) {
			self.emit('error', err);
		} else {
      // concat all entries
			var flat = _.reduce(result, function(a, b) { return a.concat(b); }, []);
			self.emit('data', flat);
		}
	});

  function doRequest(page, callback) {
    // get xml data, because json data is incomplete
  	var url = 'https://itunes.apple.com/' + country + '/rss/customerreviews/page=';
  	url += page + '/id=' + appId + '/sortBy=mostRecent/xml';
  	request.get(url, function(err, res, body) {
      if (err) {
        callback(err);
        return;
      }
  		// success
  		if (res.statusCode >= 200 || res.statusCode <= 300) {
        xml2js(body, function (err, result) {
          if (err) {
            callback(err);
            return;
          }
  				var entries = result.feed.entry || [];
          // remove 1st position data, which is app info data
          if (!_.isEmpty(entries)) entries.shift();
  				callback(null, entries);
        });
  		// fail
  		} else {
  			callback({ status: res.statusCode });
  		}
  	});
  }
};

/**
 * filter by date
 * @param {array} reviews data (Required)
 * @param {string} day like '2015-01-01' (Required)
 * @return {array} filterd data
**/
ITunesAppReview.prototype.filterByDate = function(data, day) {
	if (!_.isArray(data) || !day) return false;
  day = dateformat(day, 'yyyy-mm-dd');
	var newData = [];
	data.forEach(function(entry) {
		var updated = dateformat(entry.updated[0], 'yyyy-mm-dd');
		if (day === updated) {
			newData.push(entry);
		}
	});
	return newData;
};

/**
 * filter by version
 * @param {array} reviews data (Required)
 * @param {string} version string like '1.0.0' (Required)
 * @return {array} filterd data
**/
ITunesAppReview.prototype.filterByVersion = function(data, version) {
	if (!_.isArray(data) || !version) return false;
	var newData = [];
	data.forEach(function(entry) {
		var imVersion = entry['im:version'][0];
		if (imVersion === version) {
			newData.push(entry);
		}
	});
	return newData;
};

/**
 * summarize data
 * @param {array} reviews data (Required)
 * @return {object} summary data, it includes rating, total, average
**/
ITunesAppReview.prototype.summarize = function(data) {
	if (!_.isArray(data)) return false;
	var total = data.length;
	var ratings = { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0	};
	data.forEach(function(entry) {
		var rating = entry['im:rating'][0];
		ratings['s' + rating]++;
	});
	// average
  var average = ((ratings.s1 * 1) + (ratings.s2 * 2) + (ratings.s3 * 3) + (ratings.s4 * 4) + (ratings.s5 * 5)) / total;
  average = Math.round(average * 100) / 100;
	var summary = {
		rating: ratings,
		total: total,
		average: average
	};
	return summary;
};

/**
 * report reviews
 * @param {array} reviews data (Required)
 * @param {object} options
 * @param {string} options.separator, default: '\n'
 * @param {srring} options.day
 * @param {object} options.template
 * @param {object} options.template.header header template, you can use those variables below.
 * {title}, {day}, {separator}, {icon.s1} to {icon.s5}, {summary.total}, {summary.average}, {summary.rating.s1} to {summary.rating.s5}
 * @param {object} options.template.entry entry template, you can use those variables below.
 * {entry.title}, {entry.author}, {separator}, {entry.rating.icon}, {entry.comment}, {entry.updated}, {entry.version}
 * @return {object} summary data, it includes rating, total, average
**/
ITunesAppReview.prototype.report = function(data, options) {
	if (!_.isArray(data)) return false;
  options = options || {};
  var self = this;
  var summaryData = self.summarize(data);
  var separator = options.separator || options.sepalator || '\n'; // Leave the "sepalator" option for the compatibility due to my typo
  var day = options.day || '';
  var defaultTemplate = {};
  defaultTemplate.header = '{title} {day}{separator}';
  defaultTemplate.header += 'total:{summary.total} avg:{summary.average}{separator}';
  defaultTemplate.header += '{icon.s1} {summary.rating.s1} {icon.s2} {summary.rating.s2} {icon.s3} {summary.rating.s3} {icon.s4} {summary.rating.s4} {icon.s5} {summary.rating.s5}{separator}{separator}';
  defaultTemplate.entry = '{entry.title} by {entry.author}{separator}';
  defaultTemplate.entry += '{entry.rating.icon}{separator}';
  defaultTemplate.entry += '{entry.comment}{separator}';
  defaultTemplate.entry += '{entry.updated} {entry.version}{separator}{separator}';
  var template = options.template || defaultTemplate;
  var reviewData = {
    title: 'iTunes Review Report',
    day: day,
    icon: { s1: '★', s2: '★★', s3: '★★★', s4: '★★★★', s5: '★★★★★' },
    summary: summaryData,
    separator: separator,
    sepalator: separator // Leave the "sepalator" option for the compatibility due to my typo
  };
  var text = '';

  // insert header data
  text = interpolate(template.header, reviewData);

  // insert content data
  var contentText = '';
  data.forEach(function(entry) {
    var entryData = {
      entry: {
        title: entry.title[0],
        author: entry.author[0].name[0],
        rating: {
          icon: reviewData.icon['s' + entry['im:rating'][0]],
          number: entry['im:rating'][0]
        },
        comment: entry.content[0]._,
        updated: dateformat(entry.updated[0], 'yyyy-mm-dd h:MM:ss TT'),
        version: 'v' + entry['im:version'][0]
      },
      separator: separator,
      sepalator: separator // Leave the "sepalator" option for the compatibility due to my typo
    };
    contentText += interpolate(template.entry, entryData);
  });

  // remove unused variables
  text += contentText;
  text = text.replace(/{[\w\.\-_]+}/g, '');

	return text;
};

// export
module.exports = ITunesAppReview;
