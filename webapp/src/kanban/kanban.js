import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import Board from 'react-trello';

import Card from './card';

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
            createTeamCard: PropTypes.func.isRequired,
        }).isRequired,
    }

    componentDidMount() {
        if (this.props.channelId) {
            this.props.actions.getChannelBoard(this.props.channelId);
        } else {
            this.props.actions.getTeamBoard(this.props.teamId);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.channelId !== this.props.channelId || prevProps.teamId !== this.props.teamId) {
            if (this.props.channelId) {
                this.props.actions.getChannelBoard(this.props.channelId);
            } else {
                this.props.actions.getTeamBoard(this.props.teamId);
            }
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
                <Card/>
            </Board>
        );
    }
}
