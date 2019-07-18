/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('users endpoints', () => {
  const user = {
    id: 'user-test-1',
    name: 'test-user',
    externalId: 'external-123',
    profileUrl: 'www.test-user.com',
    email: 'test@user.com',
    custom: {
      testString: 'test',
      testNum: 123,
      testBool: true,
    },
  };
  const created = new Date().toISOString();
  const updated = new Date().toISOString();
  const eTag = 'MDcyQ0REOTUtNEVBOC00QkY2LTgwOUUtNDkwQzI4MjgzMTcwCg==';

  let pubnub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      authKey: 'myAuthKey',
    });
  });

  describe('createUser', () => {
    describe('##validation', () => {
      it('fails if id is missing', done => {
        const scope = utils
          .createNock()
          .post('/v1/objects/mySubKey/users')
          .reply(200, {
            ...user,
            created,
            updated,
            eTag,
          });
        const { id, ...noIdUser } = user;

        pubnub.createUser(noIdUser).catch(err => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing User.id');
          done();
        });
      });

      it('fails if name is missing', done => {
        const scope = utils
          .createNock()
          .post('/v1/objects/mySubKey/users')
          .reply(200, {
            ...user,
            id: 'user-test-name',
            created,
            updated,
            eTag,
          });
        const { name, ...noNameUser } = user;

        pubnub
          .createUser({
            ...noNameUser,
            id: 'test-user-name',
          })
          .catch(err => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing User.name');
            done();
          });
      });
    });
  });

  it('creates a simple user object', done => {
    const testUser = {
      id: 'simple-user-test',
      name: 'test-user',
    };

    const scope = utils
      .createNock()
      .post('/v1/objects/mySubKey/users', '{"id":"simple-user-test","name":"test-user"}')
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        auth: 'myAuthKey',
      })
      .reply(200, {
        ...user,
        created,
        updated,
        eTag,
      });

    pubnub.createUser(
      testUser,
      (status, response) => {
        assert.equal(status.error, false);
        assert.equal(response.name, 'test-user');
        assert.equal(response.eTag, eTag);
        assert.equal(scope.isDone(), true);
        done();
      }
    );
  });
});
