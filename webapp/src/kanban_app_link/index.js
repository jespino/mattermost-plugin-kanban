import {connect} from 'react-redux';

import {isTeamAppActive} from '../selectors';

import KanbanAppLink from './kanban_app_link';

function mapStateToProps(state) {
    return {
        active: isTeamAppActive(state),
    };
}

export default connect(mapStateToProps)(KanbanAppLink);
