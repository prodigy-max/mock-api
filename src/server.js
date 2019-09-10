const Server = require('@prodigy/api');
const Redis = require('@prodigy/cache');
const Config = require('@prodigy/config');
const Logger = require('@prodigy/logger');
const Pgsql = require('@prodigy/pgsql');
const Request = require('@prodigy/request');
const Auth = require('@prodigy/auth');

const envConfig = new Config(process.env);
const config = Config.loadConfigs(envConfig, __dirname.concat('/../'));
const request = new Request(config.get('@prodigy/request'));
const logger = new Logger('base-api', config.get('@prodigy/logger'));
const sessionAuthProvider = new Auth.SessionAuthProvider(new Redis(config.get('base-api.sessionCache')));
const jwtAuthProvider = new Auth.JWTAuthProvider(config.get('@prodigy/auth'));

const api = new Server({
    name: 'mock-api',
    route_dir: `${__dirname}/routes`,
    request_stats: true,
    app_key: config.get('base-api.key'),
    env: envConfig.getString('ENV'),
    port: envConfig.getString('PORT'),
    services: {
        logger,
        readDb: new Pgsql(config.get('base-api.db.read')),
        writeDb: new Pgsql(config.get('base-api.db.write')),
        sessionAuthProvider,
        jwtAuthProvider,
        request,
    },
});

api.init((err) => {
    if (err) {
        throw err;
    }
});
