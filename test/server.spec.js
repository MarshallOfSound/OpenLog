var request = require('supertest'),
    fs = require('fs');

// Initial run of the server to configure data stores
require(__dirname + '/../server/server.js').close();

describe('server responds correctly to requests', function () {
    var AUTH = 'Basic b3BlbmxvZzpwYXNzd29yZA==',
        server;
    
    beforeEach(function () {
        fs.renameSync(__dirname + '/../config.inc.json', __dirname + '/../test/original.json');
        fs.renameSync(__dirname + '/../test/config.test.json', __dirname + '/../config.inc.json');
        try {
            fs.renameSync(__dirname + '/../server/store/log_storage', __dirname + '/../test/original_storage');
            fs.renameSync(__dirname + '/../test/test_log_storage', __dirname + '/../server/store/log_storage');
        } catch (e) {
            // Do nothing
        }
        server = require(__dirname + '/../server/server.js');
    });
    afterEach(function () {
        try {
            fs.renameSync(__dirname + '/../config.inc.json', __dirname + '/../test/config.test.json');
            fs.renameSync(__dirname + '/../test/original.json', __dirname + '/../config.inc.json');
            fs.renameSync(__dirname + '/../server/store/log_storage', __dirname + '/../test/test_log_storage');
            fs.renameSync(__dirname + '/../test/original_storage', __dirname + '/../server/store/log_storage');
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