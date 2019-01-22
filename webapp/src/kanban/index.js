import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getChannelByName} from 'mattermost-redux/selectors/entities/channels';
import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';

import {getBoard} from '../selectors';
import {
    getChannelBoard, getTeamBoard, createChannelCard, createTeamCard,
    deleteChannelCard, deleteTeamCard, moveChannelCard, moveTeamCard,
    createChannelLane, createTeamLane, moveChannelLane, moveTeamLane,
    deleteChannelLane, deleteTeamLane, updateChannelLane, updateTeamLane,
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
            getChannelBoard,
            getTeamBoard,
            createChannelCard,
            createTeamCard,
            deleteChannelCard,
            deleteTeamCard,
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
