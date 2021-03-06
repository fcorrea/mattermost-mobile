// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {BackHandler, NativeModules, DeviceEventEmitter} from 'react-native';
import LocalAuth from 'react-native-local-auth';
import JailMonkey from 'jail-monkey';

const {MattermostManaged} = NativeModules;

const listeners = [];
let localConfig;

export default {
    addEventListener: (name, callback) => {
        const listener = DeviceEventEmitter.addListener(name, (config) => {
            localConfig = config;
            if (callback && typeof callback === 'function') {
                callback(config);
            }
        });

        listeners.push(listener);
        return listener;
    },
    clearListeners: () => {
        listeners.forEach((listener) => {
            listener.remove();
        });
    },
    removeEventListener: (listenerId) => {
        const index = listeners.findIndex((listener) => listener === listenerId);
        if (index !== -1) {
            listenerId.remove();
            listeners.splice(index, 1);
        }
    },
    authenticate: LocalAuth.auth,
    blurAppScreen: MattermostManaged.blurAppScreen,
    getConfig: MattermostManaged.getConfig,
    getLocalConfig: async () => {
        if (!localConfig) {
            try {
                localConfig = await MattermostManaged.getConfig();
            } catch (error) {
                // do nothing...
            }
        }

        return localConfig || {};
    },
    isDeviceSecure: async () => {
        try {
            return await LocalAuth.isDeviceSecure();
        } catch (err) {
            return false;
        }
    },
    isTrustedDevice: () => {
        if (__DEV__) {
            return true;
        }

        return JailMonkey.trustFall();
    },
    quitApp: BackHandler.exitApp,
};
