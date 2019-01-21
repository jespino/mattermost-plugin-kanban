import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import Board from 'react-trello';

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

export default class Kanban extends Component {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
        channelName: PropTypes.string,
        teamId: PropTypes.string.isRequired,
        channelId: PropTypes.string,
        board: PropTypes.object,
        actions: PropTypes.shape({
            getChannelBoard: PropTypes.func.isRequired,
            getTeamBoard: PropTypes.func.isRequired,
            createChannelCard: PropTypes.func.isRequired,
        }).isRequired,
    }

    componentDidMount() {
        if (this.props.channelId) {
            this.props.actions.getChannelBoard(this.props.channelId);
        } else {
            this.props.actions.getChannelBoard(this.props.teamId);
        }
    }

    reformatBoard = (board) => {
        const lanes = (board.ordered_lanes || []).map((laneId) => {
            const lane = {...board.lanes[laneId]};
            const cards = (lane.ordered_cards || []).map((cardId) => lane.cards[cardId]);
            lane.cards = cards.map((card) => {
                const {id, title, description, data, ...metadata} = card;
                return {id, title, description, metadata: {...metadata, ...data}};
            });
            return lane;
        });
        return {lanes};
    }

    onCardAdd = (cardData, laneId) => {
        const card = {
            title: cardData.title,
            description: cardData.description,
            lane_id: laneId,
        };
        if (this.props.channelId) {
            this.props.actions.createChannelCard(this.props.channelId, card);
        } else {
            this.props.actions.createTeamCard(this.props.teamId, card);
        }
    }

    render() {
        if (this.props.board === null) {
            return null;
        }

        return (
            <Board
                editable={true}
                data={this.reformatBoard(this.props.board)}
                draggable={true}
                canAddLanes={true}
                onDataChange={this.onChange}
                hideCardDeleteIcon={false}
                addLaneTitle={'Add status'}
                style={{backgroundColor: 'white'}}
                customCardLayout={true}
                addCardLink={<button className='btn btn-primary'>{'Add Card'}</button>}
                onCardAdd={this.onCardAdd}
            >
                <KanbanCard/>
            </Board>
        );
    }
}
