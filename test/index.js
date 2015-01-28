var assert = require('assert');
var _ = require('lodash');

var ItunesAppReviews = require('../');
var itunesAppReviews = new ItunesAppReviews();

itunesAppReviews.getReviews('349442137', 'jp', 1);

describe('onData', function() {
  it('should get array data', function () {
    itunesAppReviews.on('data', function(review) {
      assert(_.isArray(review));
    });
  });
});

describe('filterByDate()', function() {
  it('should get filtered data', function () {
    var data = [
      { updated: ['2015-01-25'] },
      { updated: ['2015-01-26'] }
    ];
    var expected = [
       { updated: ['2015-01-26'] }
    ];
    assert.deepEqual(itunesAppReviews.filterByDate(data, '2015-01-26'), expected);
  });
  
  it('should return false when the data params is not array', function () {
    assert.equal(itunesAppReviews.filterByDate({}), false);
  });
  it('should return false when the required params is empty', function () {
    assert.equal(itunesAppReviews.filterByDate(), false);
  });
});

describe('filterByVersion()', function() {
  it('should get filtered data', function () {
    var data = [
      { 'im:version': ['5.0.1'] },
      { 'im:version': ['5.0.0'] }
    ];
    var expected = [
      { 'im:version': ['5.0.0'] }
    ];
    assert.deepEqual(itunesAppReviews.filterByVersion(data, '5.0.0'), expected);
  });
  
  it('should return false when the data params is not array', function () {
    assert.equal(itunesAppReviews.filterByVersion({}), false);
  });
  it('should return false when the required params is empty', function () {
    assert.equal(itunesAppReviews.filterByVersion(), false);
  });
});

describe('summarize()', function() {
  it('should get summarized data', function () {
    var data = [
      { 'im:rating': ['1'] },
      { 'im:rating': ['2'] },
      { 'im:rating': ['3'] },
      { 'im:rating': ['4'] },
      { 'im:rating': ['5'] },
      { 'im:rating': ['1'] }
    ];
    var total = data.length;
    var average = ((2 * 1) + (1 * 2) + (1 * 3) + (1 * 4) + (1 * 5)) / total;
    average = Math.round(average * 100) / 100;
    var expected = {
      total: total,
      average: average,
      rating: {
        s1: 2,
        s2: 1,
        s3: 1,
        s4: 1,
        s5: 1
      }
    };
    assert.deepEqual(itunesAppReviews.summarize(data), expected);
  });
  
  it('should return false when the data params is not array', function () {
    assert.equal(itunesAppReviews.summarize({}), false);
  });
  it('should return false when the required params is empty', function () {
    assert.equal(itunesAppReviews.summarize(), false);
  });
});

describe('report()', function() {
  var data = [
    {
      title: ['title'],
      author: [{ name: ['author'] }],
      content: [{ '_': 'comment'}],
      updated: ['2015-01-28 9:00:00 AM'],
      'im:version': ['5.0.1'],
      'im:rating': ['5']
    }
  ];

  it('should get report customized header 1', function () {
    var expected = 'iTunes Review Report  \n ★ ★★ ★★★ ★★★★ ★★★★★';
    var options = {
      template: {
        header: '{title} {day} {sepalator} {icon.s1} {icon.s2} {icon.s3} {icon.s4} {icon.s5}',
        entry: ''
      }
    };
    assert.deepEqual(itunesAppReviews.report(data, options), expected);
  });
  
  it('should get report customized header 2', function () {
    var expected = '1 5 0 0 0 0 1';
    var options = {
      template: {
        header: '{summary.total} {summary.average} {summary.rating.s1} {summary.rating.s2} {summary.rating.s3} {summary.rating.s4} {summary.rating.s5}',
        entry: ''
      }
    };
    assert.deepEqual(itunesAppReviews.report(data, options), expected);
  });
  
  it('should get report customized entry', function () {
    var expected = 'title author \n ★★★★★ comment 2015-01-28 9:00:00 AM v5.0.1';
    var options = {
      template: {
        header: '',
        entry: '{entry.title} {entry.author} {sepalator} {entry.rating.icon} {entry.comment} {entry.updated} {entry.version}'
      }
    };
    assert.deepEqual(itunesAppReviews.report(data, options), expected);
  });
  
  it('should get report inserted day string', function () {
    var expected = 'iTunes Review Report 2015-01-28';
    var options = {
      day: '2015-01-28',
      template: {
        header: '{title} {day}',
        entry: ''
      }
    };
    assert.deepEqual(itunesAppReviews.report(data, options), expected);
  });
  
  it('should get report, sepalator is <br>', function () {
    var expected = 'iTunes Review Report<br>';
    var options = {
      sepalator: '<br>',
      template: {
        header: '{title}{sepalator}',
        entry: ''
      }
    };
    console.log(itunesAppReviews.report(data, options))
    assert.deepEqual(itunesAppReviews.report(data, options), expected);
  });
  
  it('should return false when the data params is not array', function () {
    assert.equal(itunesAppReviews.report({}), false);
  });
  it('should return false when the required params is empty', function () {
    assert.equal(itunesAppReviews.report(), false);
  });
});
