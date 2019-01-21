import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import {Link} from 'react-router-dom';
import Board from 'react-trello';

import {id as pluginId} from './manifest';

const data = {};

function KanbanCard(props) {
    return (
        <div>
            <header
                style={{
                    borderBottom: '1px solid #eee',
                    paddingBottom: 6,
                    marginBottom: 10,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{fontSize: 14, fontWeight: 'bold'}}>{props.title}</div>
                <div style={{fontSize: 11}}>{props.label}</div>
            </header>
            <div style={{fontSize: 12, color: '#BD3B36'}}>
                <div style={{padding: '5px 0px'}}>
                    <i>{props.description}</i>
                </div>
            </div>
        </div>
    );
}

class Kanban extends Component {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
        channelName: PropTypes.string,
    }

    onChange = (newData) => {
        if (this.props.channelName) {
            data[this.props.channelName] = newData;
        } else {
            data['@' + this.props.teamName] = newData;
        }
    }

    render() {
        let boardData = null;
        if (this.props.channelName) {
            boardData = data[this.props.channelName];
        } else {
            boardData = data['@' + this.props.teamName];
        }
        boardData = boardData || {lanes: [
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
                data={boardData}
                draggable={true}
                canAddLanes={true}
                onDataChange={this.onChange}
                hideCardDeleteIcon={false}
                addLaneTitle={'Add status'}
                style={{backgroundColor: 'white'}}
                customCardLayout={true}
                addCardLink={<button className='btn btn-primary'>Add Card</button>}
            >
                <KanbanCard/>
            </Board>
        );
    }
}

function KanbanAppLink(props) {
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

KanbanAppLink.propTypes = {
    teamName: PropTypes.string.isRequired,
};

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
        registry.registerTeamAppComponent(KanbanAppLink);
        registry.registerAppCenterComponent('kanban', Kanban);
    }
}

window.registerPlugin(pluginId, new Plugin());
