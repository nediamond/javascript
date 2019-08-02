/* @flow */

import {
  MembersInput,
  MembersListResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation(): string {
  return operationConstants.PNGetMembersOperation;
}

export function validateParams({ config }: ModulesInject, incomingParams: MembersInput) {
  let { spaceId } = incomingParams;

  if (!spaceId) return 'Missing spaceId';
}

export function getURL(
  modules: ModulesInject,
  incomingParams: MembersInput
  ): string {
  let { config } = modules;

  return `/v1/objects/${config.subscribeKey}/spaces/${incomingParams.spaceId}/users`;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(
  // eslint-disable-next-line no-unused-vars
  modules: ModulesInject,
  // eslint-disable-next-line no-unused-vars
  incomingParams: MembersInput
): Object {
  const { include, limit, page } = incomingParams;
  const params = {};

  // it is a paged list of users so include the total count in the response  params.count = true;
  params.count = true;

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    let includes = [];

    if (include.totalCount) {
      includes.push('totalCount');
    }

    if (include.customFields) {
      includes.push('customFields');
    }

    if (include.userFields) {
      includes.push('userFields');
    }

    if (include.customUserFields) {
      includes.push('customUserFields');
    }

    let includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includes.join(',');
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }
    if (page.prev) {
      params.end = page.prev;
    }
  }

  return params;
}

export function handleResponse(
  modules: ModulesInject,
  membersResponse: Object
): MembersListResponse {
  return membersResponse;
}
