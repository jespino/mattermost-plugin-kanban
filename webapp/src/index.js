import React from 'react';

import {id as pluginId} from './manifest';

import reducer from './reducer';
import {getBoard} from './selectors';
import {BOARD_CHANGED} from './action_types';

import Kanban from './kanban';
import KanbanAppLink from './kanban_app_link';
import ChannelHeaderIcon from './channel_header_icon';

export default class Plugin {
    initialize(registry, store, browserHistory) {
        const state = store.getState();
        registry.registerChannelHeaderButtonAction(
            <ChannelHeaderIcon/>,
            (channel) => {
                if (browserHistory.location.pathname === '/' + state.entities.teams.teams[channel.team_id].name + '/channel-apps/' + channel.name + '/kanban') {
                    browserHistory.push('/' + state.entities.teams.teams[channel.team_id].name + '/channels/' + channel.name);
                } else {
                    browserHistory.push('/' + state.entities.teams.teams[channel.team_id].name + '/channel-apps/' + channel.name + '/kanban');
                }
            },
            'Channel Kanban Board',
            'Channel Kanban Board',
        );
        registry.registerTeamAppComponent(KanbanAppLink);
        registry.registerAppCenterComponent('kanban', Kanban);
        registry.registerReducer(reducer);
        registry.registerWebSocketEventHandler(
            'custom_' + pluginId + '_board_changed',
            (message) => {
                const s = store.getState();
                const board = JSON.parse(message.data.board);
                if (board.id === (getBoard(s) || {}).id) {
                    store.dispatch({
                        type: BOARD_CHANGED,
                        data: board,
                    });
                }
            },
        );
    }
}

window.registerPlugin(pluginId, new Plugin());
