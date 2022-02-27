const redis = require('redis');
const { getClient: getRedisClient, getCluster: getRedisCluster } = require('../redis');

let data;

const redisGet = jest.fn()
  .mockImplementationOnce(() => Promise.resolve(null))
  .mockImplementationOnce(key => new Promise(resolve => resolve(data[key])))
  .mockImplementationOnce(() => Promise.resolve(null))
  .mockImplementationOnce(key => new Promise(resolve => resolve(data[key])));

const redisSet = jest.fn().mockImplementation((key, value) => {
  data[key] = value;
});

jest.spyOn(redis, 'createClient').mockImplementation(() => ({
  get: redisGet,
  set: redisSet,
}));

jest.spyOn(redis, 'createCluster').mockImplementation(() => ({
  get: redisGet,
  set: redisSet,
}));


describe('Auth', () => {
  beforeEach(() => {
    data = {};
    jest.clearAllMocks();
  });

  afterAll(() => {
    redis.quit();
  });

  it('wrap redis client', async () => {
    expect.assertions(3);

    const client = getRedisClient({
      host: 'localhost',
    });


    let cacheRes = await client.get('testKey');
    expect(cacheRes).toEqual(null);
    await client.set('testKey', 'some-data');
    cacheRes = await client.get('testKey');
    expect(cacheRes).toEqual('some-data');

    expect(redis.createClient.mock.calls).toEqual([[{ host: 'localhost' }]]);
  });

  it('wrap redis cluster', async () => {
    expect.assertions(3);

    const config = {
      rootNodes: [
        {
          host: 'redis-0',
        },
        {
          host: 'redis-1',
        },
        {
          host: 'redis-2',
        },
      ],
      defaults: {
        port: 6379,
        prefix: 'verdaccio-bitbucket:',
      },
    };

    const client = getRedisCluster(config);

    let cacheRes = await client.get('testKey');
    expect(cacheRes).toEqual(null);
    await client.set('testKey', 'some-data');
    cacheRes = await client.get('testKey');
    expect(cacheRes).toEqual('some-data');

    expect(redis.createCluster.mock.calls).toEqual([[config]]);
  });
});
