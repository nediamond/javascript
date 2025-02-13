/* @flow */
import {
  MessageAnnouncement,
  StatusAnnouncement,
  SignalAnnouncement,
  CallbackStruct,
  PresenceAnnouncement,
} from '../flow_interfaces';
import categoryConstants from '../constants/categories';

export default class {
  _listeners: Array<CallbackStruct>;

  constructor() {
    this._listeners = [];
  }

  addListener(newListeners: CallbackStruct) {
    this._listeners.push(newListeners);
  }

  removeListener(deprecatedListener: CallbackStruct) {
    let newListeners = [];

    this._listeners.forEach((listener) => {
      if (listener !== deprecatedListener) newListeners.push(listener);
    });

    this._listeners = newListeners;
  }

  removeAllListeners() {
    this._listeners = [];
  }

  announcePresence(announce: PresenceAnnouncement) {
    this._listeners.forEach((listener) => {
      if (listener.presence) listener.presence(announce);
    });
  }

  announceStatus(announce: StatusAnnouncement) {
    this._listeners.forEach((listener) => {
      if (listener.status) listener.status(announce);
    });
  }

  announceMessage(announce: MessageAnnouncement) {
    this._listeners.forEach((listener) => {
      if (listener.message) listener.message(announce);
    });
  }

  announceSignal(announce: SignalAnnouncement) {
    this._listeners.forEach((listener) => {
      if (listener.signal) listener.signal(announce);
    });
  }

  announceNetworkUp() {
    let networkStatus: StatusAnnouncement = {};
    networkStatus.category = categoryConstants.PNNetworkUpCategory;
    this.announceStatus(networkStatus);
  }

  announceNetworkDown() {
    let networkStatus: StatusAnnouncement = {};
    networkStatus.category = categoryConstants.PNNetworkDownCategory;
    this.announceStatus(networkStatus);
  }
}
