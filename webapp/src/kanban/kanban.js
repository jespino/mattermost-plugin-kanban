import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import Board from 'react-trello';

import LoadingScreen from 'components/loading_screen.jsx';

import Card from './card';
import CreateLaneModal from './create_lane_modal';
import CreateOrEditCardModal from './create_or_edit_card_modal';
import ConfirmModal from './confirm_modal';
import LaneHeader from './lane_header';

import styles from './kanban.css';

export default class Kanban extends Component {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
        channelName: PropTypes.string,
        teamId: PropTypes.string.isRequired,
        channelId: PropTypes.string,
        board: PropTypes.object,
        actions: PropTypes.shape({
            setAppActive: PropTypes.func.isRequired,
            unsetBoard: PropTypes.func.isRequired,
            selectChannel: PropTypes.func.isRequired,
            getChannelBoard: PropTypes.func.isRequired,
            getTeamBoard: PropTypes.func.isRequired,
            createChannelCard: PropTypes.func.isRequired,
            createTeamCard: PropTypes.func.isRequired,
            deleteChannelCard: PropTypes.func.isRequired,
            deleteTeamCard: PropTypes.func.isRequired,
            updateChannelCard: PropTypes.func.isRequired,
            updateTeamCard: PropTypes.func.isRequired,
            moveChannelCard: PropTypes.func.isRequired,
            moveTeamCard: PropTypes.func.isRequired,
            createChannelLane: PropTypes.func.isRequired,
            createTeamLane: PropTypes.func.isRequired,
            moveChannelLane: PropTypes.func.isRequired,
            moveTeamLane: PropTypes.func.isRequired,
            deleteChannelLane: PropTypes.func.isRequired,
            deleteTeamLane: PropTypes.func.isRequired,
            updateChannelLane: PropTypes.func.isRequired,
            updateTeamLane: PropTypes.func.isRequired,
        }).isRequired,
    }

    state = {
        creatingLane: false,
        updatingCard: null,
        deletingCard: false,
        deletingCardId: null,
        deletingCardLaneId: null,
        deletingLane: false,
        deletingLaneId: null,
    }

    componentDidMount() {
        this.props.actions.unsetBoard();
        if (this.props.channelId) {
            this.props.actions.getChannelBoard(this.props.channelId);
            this.props.actions.selectChannel(this.props.channelId);
            this.props.actions.setAppActive('channel');
        } else {
            this.props.actions.getTeamBoard(this.props.teamId);
            this.props.actions.selectChannel(null);
            this.props.actions.setAppActive('team');
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.channelId !== this.props.channelId || prevProps.teamId !== this.props.teamId) {
            this.props.actions.unsetBoard();
            if (this.props.channelId) {
                this.props.actions.getChannelBoard(this.props.channelId);
                this.props.actions.selectChannel(this.props.channelId);
                this.props.actions.setAppActive('channel');
            } else {
                this.props.actions.getTeamBoard(this.props.teamId);
                this.props.actions.selectChannel(null);
                this.props.actions.setAppActive('team');
            }
        }
    }

    componentWillUnmount() {
        this.props.actions.unsetBoard();
        this.props.actions.setAppActive('');
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
            data: cardData.metadata,
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

    updateLaneTitle = (laneId, newTitle) => {
        const lane = {...this.props.board.lanes[laneId], title: newTitle};
        if (this.props.channelId) {
            this.props.actions.updateChannelLane(this.props.channelId, lane);
        } else {
            this.props.actions.updateTeamLane(this.props.teamId, lane);
        }
    }

    updateCard = (card) => {
        const newCard = {...this.props.board.lanes[card.laneId].cards[card.id], title: card.title, description: card.description};
        newCard.data = {...newCard.data, ...card.metadata};
        if (this.props.channelId) {
            this.props.actions.updateChannelCard(this.props.channelId, newCard.laneId, newCard);
        } else {
            this.props.actions.updateTeamCard(this.props.teamId, newCard.laneId, newCard);
        }
        this.setState({updatingCard: null});
    }

    render() {
        if (this.props.board === null) {
            return <LoadingScreen/>;
        }

        const addCardLink = (
            <button
                className={'btn btn-primary ' + styles.addCardButton}
            >
                {'Add Card'}
            </button>
        );

        return (
            <div className={styles.kanban}>
                <button
                    className={'btn btn-primary ' + styles.addLaneButton}
                    onClick={this.openCreatingLaneModal}
                >
                    {'Add Lane'}
                </button>
                <CreateLaneModal
                    show={this.state.creatingLane}
                    onClose={this.closeCreatingLaneModal}
                    onCreate={this.createLane}
                />
                {this.state.updatingCard &&
                    <CreateOrEditCardModal
                        card={this.state.updatingCard}
                        onAdd={this.updateCard}
                        onCancel={() => this.setState({updatingCard: null})}
                    />}
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
                    newCardTemplate={<CreateOrEditCardModal/>}
                    onCardAdd={this.onCardAdd}
                    handleDragEnd={this.onDropCard}
                    handleLaneDragEnd={this.onDropLane}
                    customLaneHeader={
                        <LaneHeader
                            onDeleteClicked={this.openDeletingLaneModal}
                            onUpdateTitle={this.updateLaneTitle}
                        />
                    }
                >
                    <Card
                        onDeleteClicked={this.openDeletingCardModal}
                        onEditClicked={(card) => this.setState({updatingCard: card})}
                    />
                </Board>
            </div>
        );
    }
}
