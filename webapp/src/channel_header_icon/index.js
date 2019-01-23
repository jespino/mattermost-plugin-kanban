import {connect} from 'react-redux';

import {isChannelAppActive} from '../selectors';

import ChannelHeaderIcon from './channel_header_icon';

function mapStateToProps(state) {
    return {
        active: isChannelAppActive(state),
    };
}

export default connect(mapStateToProps)(ChannelHeaderIcon);
