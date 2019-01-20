import React, {Component} from 'react'
import {Link} from 'react-router-dom';
import Board from 'react-trello'

import {id as pluginId} from './manifest';

const data = {};

class Kanban extends Component {
    render() {
        const channelData = data[this.props.channelName] || {lanes: [
            {
                id: 'todo',
                title: 'ToDo',
                cards: [],
            },
            {
                id: 'doing',
                title: 'Doing',
                cards: [],
            },
            {
                id: 'done',
                title: 'Done',
                cards: [],
            },
        ]};
        return (
            <Board
                editable={true}
                data={channelData}
                draggable={true}
                canAddLanes={true}
                onDataChange={(newData) => {
                    data[this.props.channelName] = newData;
                }}
                onCardAdd={() => {}}
                style={{backgroundColor: 'white'}}
            />
        );
    }
}

function Example(props) {
    return (
        <li>
            <Link
                className='sidebar-item'
                to={'/' + props.teamName + '/apps/kanban'}
            >
                <span className='icon'><i className='fa fa-trello'/></span>
                <span className='sidebar-item__name'>
                    <span>{'Kanban'}</span>
                </span>
            </Link>
        </li>
    );
}

export default class Plugin {
    initialize(registry, store, browserHistory) {
        const state = store.getState();
        registry.registerChannelHeaderButtonAction(
            <i className='fa fa-trello'/>,
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
        registry.registerTeamAppComponent(Example);
        registry.registerAppCenterComponent('kanban', Kanban);
    }
}

window.registerPlugin(pluginId, new Plugin());
