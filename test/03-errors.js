var ClickHouse = require ("../src/clickhouse");

var http = require ('http');
var url  = require ('url');
var qs   = require ('querystring');

var assert = require ("assert");

describe ("error parsing", function () {

	var server,
		host = process.env.CLICKHOUSE_HOST || '127.0.0.1',
		port = process.env.CLICKHOUSE_PORT || 8123,
		dbCreated = false;

	it ("returns error for unknown sql", function (done) {
		var ch = new ClickHouse ({host: host, port: port, useQueryString: true});
		var stream = ch.query ("ABCDEFGHIJKLMN", {syncParser: true}, function (err, result) {
			// assert (err);
			// done ();
		});

		stream.on ('error', function (err) {

			assert (err);
			assert (err.message.match (/Syntax error/));
			assert.equal (err.lineno, 1, "line number should eq 1");
			assert.equal (err.colno, 1, "col  number should eq 1");
			// console.log (err);
			done();
		});
	});

	it ("returns error with line/col for sql with garbage", function (done) {
		var ch = new ClickHouse ({host: host, port: port, useQueryString: true});
		var stream = ch.query ("INSERT\n\t\tABCDEFGHIJKLMN", {syncParser: true}, function (err, result) {
			// assert (err);
			// done ();
		});

		stream.on ('error', function (err) {

			assert (err);
			assert (err.message.match (/Syntax error/));
			assert.equal (err.lineno, 2, "line number should eq 2");
			assert.equal (err.colno, 3, "col  number should eq 3");
			// console.log (err);
			done();
		});
	});

	it ("returns error for empty sql", function (done) {
		var ch = new ClickHouse ({host: host, port: port, useQueryString: true});
		var stream = ch.query ("-- nothing here", {syncParser: true}, function (err, result) {
			// assert (err);
			// done ();
		});

		stream.on ('error', function (err) {

			// console.log (err); // failed at end of query

			assert (err);
			assert (err.message.match (/Syntax error/));
			assert.ifError ('lineno' in err);
			assert.ifError ('colno'  in err);
			done();
		});
	});

	it ("returns error for unknown table", function (done) {
		var ch = new ClickHouse ({host: host, port: port, useQueryString: true});
		var stream = ch.query ("SELECT * FROM xxx", {syncParser: true}, function (err, result) {
			// assert (err);
			// done ();
		});

		stream.on ('error', function (err) {

			assert (err);
			assert.ifError (err.message.match (/Syntax error/));
			assert.ifError ('lineno' in err);
			assert.ifError ('colno'  in err);

			done();
		});
	});



});