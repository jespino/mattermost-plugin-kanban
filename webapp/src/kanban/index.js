import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannelByName} from 'mattermost-redux/selectors/entities/channels';
import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';
import {selectChannel} from 'mattermost-redux/actions/channels';

import {getBoard} from '../selectors';
import {
    getChannelBoard, getTeamBoard, createChannelCard, createTeamCard,
    deleteChannelCard, deleteTeamCard, moveChannelCard, moveTeamCard,
    updateChannelCard, updateTeamCard,
    createChannelLane, createTeamLane, moveChannelLane, moveTeamLane,
    deleteChannelLane, deleteTeamLane, updateChannelLane, updateTeamLane,
    setAppActive, unsetBoard,
} from '../actions';

import Kanban from './kanban';

function mapStateToProps(state, ownProps) {
    return {
        channelId: (getChannelByName(state, ownProps.channelName) || {}).id,
        teamId: (getTeamByName(state, ownProps.teamName) || {}).id,
        board: getBoard(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            setAppActive,
            unsetBoard,
            selectChannel,
            getChannelBoard,
            getTeamBoard,
            createChannelCard,
            createTeamCard,
            deleteChannelCard,
            deleteTeamCard,
            updateChannelCard,
            updateTeamCard,
            moveChannelCard,
            moveTeamCard,
            createChannelLane,
            createTeamLane,
            moveChannelLane,
            moveTeamLane,
            deleteChannelLane,
            deleteTeamLane,
            updateChannelLane,
            updateTeamLane,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Kanban);
