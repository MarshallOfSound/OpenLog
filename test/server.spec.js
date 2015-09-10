var request = require('supertest'),
    fs = require('fs'),
    Engine = require('tingodb')();

describe('server responds correctly to requests', function () {
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
    it('responds with 401 to / for unauthorized clients', function testSlash(done) {
        request(server)
            .get('/')
            .expect(401, done);
    });
    it('responds with 200 to / for authorized clients', function testSlash(done) {
        request(server)
            .get('/')
            .set('Authorization', AUTH)
            .expect(200, done);
    });
    it('allows log post requests', function testPath(done) {
        request(server)
            .post('/log')
            .send([])
            .expect(200, done);
    });
    it ('does not allow log get requests', function testPath(done) {
        request(server)
            .get('/log')
            .expect(404, done);
    });
    it ('responds with 401 to all other unauthorized requests', function testPath(done) {
        request(server)
            .get('/foo/bar')
            .expect(401, done);
    });
    it ('responds with 404 to all other authorized requests', function testPath(done) {
        request(server)
            .get('/foo/bar')
            .set('Authorization', AUTH)
            .expect(404, done);
    });
});