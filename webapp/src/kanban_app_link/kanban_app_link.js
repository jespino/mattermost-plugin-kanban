import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import {Link} from 'react-router-dom';

export default class KanbanAppLink extends Component {
    static propTypes = {
        teamName: PropTypes.string.isRequired,
        active: PropTypes.string.isRequired,
    };

    render() {
        return (
            <li className={this.props.active && 'active'}>
                <a
                    className='sidebar-item'
                    href={'/' + this.props.teamName + '/apps/kanban'}
                >
                    <span className='icon'><i className='fa fa-trello'/></span>
                    <span className='sidebar-item__name'>
                        <span>{'Team Kanban'}</span>
                    </span>
                </a>
            </li>
        );
    }
}
