/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('members endpoints', () => {
  const member = {
    id: 'member-test-1',
    custom: {
      testString: 'test',
      testNum: 123,
      testBool: true,
    },
    user: {
      id: 'user-1',
      name: 'Bob Cat',
      externalId: null,
      profileUrl: null,
      email: 'bobc@example.com',
      custom: {
        phone: '999-999-9999'
      },
    },

  };
  const created = new Date().toISOString();
  const updated = new Date().toISOString();
  const eTag = 'MDcyQ0REOTUtNEVBOC00QkY2LTgwOUUtNDkwQzI4MjgzMTcwCg==';
  const member2 = {
    id: 'member-test-2',
    custom: {
      testString: 'test2',
      testNum: 456,
      testBool: true,
    },
    space: {
      id: 'user-2',
      name: 'Bob Cat 2',
      externalId: null,
      profileUrl: null,
      email: 'bobc2@example.com',
      custom: {
        phone: '999-999-9999'
      },
    }
  };
  const created2 = new Date().toISOString();
  const updated2 = new Date().toISOString();
  const eTag2 = 'MDcyQ0REOTUtNEVBOC00QkY2LTgwOUUtNDkwQzI4MjgzMTcwCg==';

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

  describe('getMembers', () => {
    it('gets a list of members objects', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/objects/mySubKey/spaces/mySpaceId/users')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          count: true,
          limit: 2
        })
        .reply(200, {
          data: [
            {
              ...member,
              created,
              updated,
              eTag,
            },
            {
              ...member2,
              created: created2,
              updated: updated2,
              eTag: eTag2,
            }
          ],
          next: 'MUIwQTAwMUItQkRBRC00NDkyLTgyMEMtODg2OUU1N0REMTNBCg==',
          prev: 'M0FFODRENzMtNjY2Qy00RUExLTk4QzktNkY1Q0I2MUJFNDRCCg==',
          status: 200,
          totalCount: 9
        });

      pubnub.getMembers({
        spaceId: 'mySpaceId',
        limit: 2
      },
      (status, response) => {
        assert.equal(status.error, false);

        assert.equal(response.data[0].id, 'member-test-1');
        assert.equal(response.data[0].eTag, eTag);

        assert.equal(response.data[1].id, 'member-test-2');
        assert.equal(response.data[1].eTag, eTag2);

        assert.equal(response.totalCount, 9);

        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });
});
