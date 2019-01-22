import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import Board from 'react-trello';

import Card from './card';
import CreateLaneModal from './create_lane_modal';
import CreateCardModal from './create_card_modal';
import ConfirmModal from './confirm_modal';

function LaneHeader(props) {
    const {id, title, onDeleteClicked} = props;
    return (
        <div style={{display: 'flex'}}>
            <span style={{flexGrow: 1, fontSize: '1.2em'}}>{title}</span>
            <a onClick={() => onDeleteClicked(id)}>{'x'}</a>
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
            createTeamCard: PropTypes.func.isRequired,
            deleteChannelCard: PropTypes.func.isRequired,
            deleteTeamCard: PropTypes.func.isRequired,
            moveChannelCard: PropTypes.func.isRequired,
            moveTeamCard: PropTypes.func.isRequired,
            createChannelLane: PropTypes.func.isRequired,
            createTeamLane: PropTypes.func.isRequired,
            moveChannelLane: PropTypes.func.isRequired,
            moveTeamLane: PropTypes.func.isRequired,
            deleteChannelLane: PropTypes.func.isRequired,
            deleteTeamLane: PropTypes.func.isRequired,
        }).isRequired,
    }

    state = {
        creatingLane: false,
        deletingCard: false,
        deletingCardId: null,
        deletingCardLaneId: null,
        deletingLane: false,
        deletingLaneId: null,
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

    openDeletingCardModal = (cardId, laneId) => {
        this.setState({
            deletingCard: true,
            deletingCardId: cardId,
            deletingCardLaneId: laneId,
        });
    }

    closeDeletingCardModal = () => {
        this.setState({
            deletingCard: false,
            deletingCardId: null,
            deletingCardLaneId: null,
        });
    }

    deleteCard = () => {
        if (this.props.channelId) {
            this.props.actions.deleteChannelCard(this.props.channelId, this.state.deletingCardLaneId, this.state.deletingCardId);
        } else {
            this.props.actions.deleteTeamCard(this.props.teamId, this.state.deletingCardLaneId, this.state.deletingCardId);
        }
        this.closeDeletingCardModal();
    }

    openDeletingLaneModal = (laneId) => {
        this.setState({
            deletingLane: true,
            deletingLaneId: laneId,
        });
    }

    closeDeletingLaneModal = () => {
        this.setState({
            deletingLane: false,
            deletingLaneId: null,
        });
    }

    deleteLane = () => {
        if (this.props.channelId) {
            this.props.actions.deleteChannelLane(this.props.channelId, this.state.deletingLaneId);
        } else {
            this.props.actions.deleteTeamLane(this.props.teamId, this.state.deletingLaneId);
        }
        this.closeDeletingLaneModal();
    }

    onDropCard = (cardId, sourceLaneId, targetLaneId, position) => {
        if (this.props.channelId) {
            this.props.actions.moveChannelCard(this.props.channelId, cardId, sourceLaneId, targetLaneId, position);
        } else {
            this.props.actions.moveTeamCard(this.props.teamId, cardId, sourceLaneId, targetLaneId, position);
        }
    }

    onDropLane = (oldPosition, newPosition, lane) => {
        if (this.props.channelId) {
            this.props.actions.moveChannelLane(this.props.channelId, lane.id, newPosition);
        } else {
            this.props.actions.moveTeamLane(this.props.teamId, lane.id, newPosition);
        }
    }

    openCreatingLaneModal = () => {
        this.setState({creatingLane: true});
    }

    closeCreatingLaneModal = () => {
        this.setState({creatingLane: false});
    }

    createLane = (name) => {
        const lane = {title: name};
        if (this.props.channelId) {
            this.props.actions.createChannelLane(this.props.channelId, lane);
        } else {
            this.props.actions.createTeamLane(this.props.teamId, lane);
        }
    }

    render() {
        if (this.props.board === null) {
            return null;
        }

        const addCardLink = (
            <button
                className='btn btn-primary'
                style={{float: 'right', marginTop: 10}}
            >
                {'Add Card'}
            </button>
        );

        return (
            <div>
                <button
                    className='btn btn-primary'
                    style={{float: 'right', margin: 10}}
                    onClick={this.openCreatingLaneModal}
                >
                    {'Add Lane'}
                </button>
                <CreateLaneModal
                    show={this.state.creatingLane}
                    onClose={this.closeCreatingLaneModal}
                    onCreate={this.createLane}
                />
                <ConfirmModal
                    title='Delete card'
                    text='Are you sure you want to delete this card?'
                    show={this.state.deletingCard}
                    onClose={this.closeDeletingCardModal}
                    onAccept={this.deleteCard}
                />
                <ConfirmModal
                    title='Delete lane'
                    text='Are you sure you want to delete this lane?'
                    show={this.state.deletingLane}
                    onClose={this.closeDeletingLaneModal}
                    onAccept={this.deleteLane}
                />
                <Board
                    editable={true}
                    data={this.reformatBoard(this.props.board)}
                    draggable={true}
                    canAddLanes={true}
                    onDataChange={this.onChange}
                    hideCardDeleteIcon={true}
                    addLaneTitle={'Add status'}
                    style={{backgroundColor: 'white'}}
                    customCardLayout={true}
                    addCardLink={addCardLink}
                    newCardTemplate={<CreateCardModal/>}
                    onCardAdd={this.onCardAdd}
                    handleDragEnd={this.onDropCard}
                    handleLaneDragEnd={this.onDropLane}
                    customLaneHeader={<LaneHeader onDeleteClicked={this.openDeletingLaneModal}/>}
                >
                    <Card onDeleteClicked={this.openDeletingCardModal}/>
                </Board>
            </div>
        );
    }
}
