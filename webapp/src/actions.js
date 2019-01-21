import request from 'superagent';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {id as pluginId} from './manifest';
import {BOARD_CHANGED} from './action_types';

const doGet = async (url, body, headers = {}) => {
    headers['X-Requested-With'] = 'XMLHttpRequest';
    headers['X-Timezone-Offset'] = new Date().getTimezoneOffset();

    try {
        const response = await request.
            get(url).
            set(headers).
            accept('application/json');

        return response.body;
    } catch (err) {
        throw err;
    }
};

const doPost = async (url, body, headers = {}) => {
    headers['X-Requested-With'] = 'XMLHttpRequest';
    headers['X-Timezone-Offset'] = new Date().getTimezoneOffset();

    try {
        const response = await request.
            post(url).
            send(body).
            set(headers).
            type('application/json').
            accept('application/json');
        return response.body;
    } catch (err) {
        throw err;
    }
};

export const getPluginServerRoute = (state) => {
    const config = getConfig(state);

    let basePath = '/';
    if (config && config.SiteURL) {
        basePath = new URL(config.SiteURL).pathname;

        if (basePath && basePath[basePath.length - 1] === '/') {
            basePath = basePath.substr(0, basePath.length - 1);
        }
    }

    return basePath + '/plugins/' + pluginId;
};

export const getChannelBoard = (channelId) => async (dispatch, getState) => {
    doGet(getPluginServerRoute(getState()) + '/c-' + channelId).then((r) => {
        dispatch({
            type: BOARD_CHANGED,
            data: r,
        });
    });
};

export const getTeamBoard = (teamId) => async (dispatch, getState) => {
    doGet(getPluginServerRoute(getState()) + '/t-' + teamId).then((r) => {
        dispatch({
            type: BOARD_CHANGED,
            data: r,
        });
    });
};

export const createChannelCard = (channelId, card) => async (dispatch, getState) => {
    doPost(getPluginServerRoute(getState()) + '/channel/' + channelId + '/card', card);
};

export const createTeamCard = (teamId, card) => async (dispatch, getState) => {
    doPost(getPluginServerRoute(getState()) + '/team/' + teamId + '/card', card);
};
