/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('spaces endpoints', () => {
  const space = {
    id: 'space-test-1',
    name: 'test-space',
    description: 'test space',
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

  describe('updateSpace', () => {
    describe('##validation', () => {
      it('fails if id is missing', (done) => {
        const scope = utils
          .createNock()
          .patch('/v1/objects/mySubKey/spaces')
          .reply(200, {
            ...space,
            created,
            updated,
            eTag,
          });
        const { id, ...noIdSpace } = space;

        pubnub.updateSpace(noIdSpace).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing Space.id');
          done();
        });
      });

      it('fails if name is missing', (done) => {
        const scope = utils
          .createNock()
          .patch('/v1/objects/mySubKey/spaces')
          .reply(200, {
            ...space,
            id: 'space-test-name',
            created,
            updated,
            eTag,
          });
        const { name, ...noNameSpace } = space;

        pubnub
          .updateSpace({
            ...noNameSpace,
            id: 'test-space-name',
          })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing Space.name');
            done();
          });
      });
    });

    it('updates a simple space object', (done) => {
      const scope = utils
        .createNock()
        .patch('/v1/objects/mySubKey/spaces')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          ...space,
          name: 'Simple Space',
          created,
          updated,
          eTag,
        });

      pubnub.updateSpace(
        {
          id: 'simple-space-test',
          name: 'Simple Space',
        },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.name, 'Simple Space');
          assert.ok(typeof response.eTag !== 'undefined');
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });
  });
});
