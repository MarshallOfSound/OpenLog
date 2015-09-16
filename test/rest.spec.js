var request = require('supertest'),
    should = require('should'),
    fs = require('fs'),
    Engine = require('tingodb')();

describe('rest API responds correctly to requests', function () {
    var AUTH = 'Basic b3BlbmxvZzpwYXNzd29yZA==',
        server;

    beforeEach(function () {
        process.args = {
            config: JSON.parse(fs.readFileSync(__dirname + '/../config.inc.json')),
            db: new Engine.Db(__dirname, {})
        };
        fs.createReadStream(__dirname + "/test_log_storage").pipe(fs.createWriteStream(__dirname + "/log_storage"));
        server = require(__dirname + '/../server/server.js');
    });
    afterEach(function () {
        try {
            server.close();
            server = null;
        } catch (e) {
            // Do nothing
        }
    });
    it('stats request is OK', function testStats(done) {
        request(server)
            .get('/rest/logs/stats')
            .set('Authorization', AUTH)
            .expect(200)
            .end(function(err, res) {
                var sum = 0;
                if (err) {
                    throw err;
                }
                res.body.should.have.property('quantity');
                res.body.should.have.property('pages');
                res.body.should.have.property('past');
                res.body.quantity.total.should.equal(res.body.quantity.error + res.body.quantity.warn + res.body.quantity.info);
                for (var key in res.body.pages) {
                    if (res.body.pages.hasOwnProperty(key) && key !== 'total') {
                        sum += res.body.pages[key];
                    }
                }
                res.body.pages.total.should.equal(sum);
                done();
            });
    });
    it('pages request is OK', function testPages(done) {
        request(server)
            .get('/rest/logs/pages')
            .set('Authorization', AUTH)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                res.body.length.should.equal(3);
                done();
            });
    });
});