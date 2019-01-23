import React, {Component} from 'react';
import {PropTypes} from 'prop-types';

export default class ChannelHeaderIcon extends Component {
    static propTypes = {
        active: PropTypes.string.isRequired,
    };

    render() {
        return (
            <i
                style={(this.props.active && {color: '#166de0'}) || {}}
                className='fa fa-trello'
            />
        );
    }
}
