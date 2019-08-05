/* @flow */

import {
  SpacesObjectInput,
  SpacesResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

function prepareMessagePayload(modules, messagePayload) {
  const { crypto, config } = modules;
  let stringifiedPayload = JSON.stringify(messagePayload);

  if (config.cipherKey) {
    stringifiedPayload = crypto.encrypt(stringifiedPayload);
    stringifiedPayload = JSON.stringify(stringifiedPayload);
  }

  return stringifiedPayload;
}

export function getOperation(): string {
  return operationConstants.PNUpdateSpaceOperation;
}

export function validateParams(
  { config }: ModulesInject,
  incomingParams: SpacesObjectInput
) {
  let { id, name, custom } = incomingParams;

  if (!id) return 'Missing Space.id';
  if (!name) return 'Missing Space.name';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (custom) {
    if (
      !Object.values(custom).every(
        (value) =>
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
      )
    ) {
      return 'Invalid custom type, only string, number and boolean values are allowed.';
    }
  }
}

export function usePatch() {
  return true;
}

export function getURL(modules: ModulesInject): string {
  let { config } = modules;
  return `/v1/objects/${config.subscribeKey}/spaces`;
}

export function patchURL(modules: ModulesInject): string {
  const { config } = modules;
  return `/v1/objects/${config.subscribeKey}/spaces`;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(
  modules: ModulesInject,
  incomingParams: SpacesObjectInput
): Object {
  const { include } = incomingParams;
  const params = {};

  if (include) {
    let includes = [];

    if (include.customFields) {
      includes.push('custom');
    }

    let includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  return params;
}

export function patchPayload(
  modules: ModulesInject,
  incomingParams: SpacesObjectInput
): string {
  const { message } = incomingParams;
  return prepareMessagePayload(modules, message);
}

export function handleResponse(
  modules: ModulesInject,
  spacesResponse: Object
): SpacesResponse {
  return spacesResponse;
}
