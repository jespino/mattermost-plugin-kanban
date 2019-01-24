import React, {Component} from 'react';
import {PropTypes} from 'prop-types';

import styles from './lane_header.css';

export default class LaneHeader extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        onDeleteClicked: PropTypes.func.isRequired,
        onUpdateTitle: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            editedTitle: '',
            editing: false,
        };
        this.inputRef = React.createRef();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.editing === false && this.state.editing === true) {
            this.inputRef.current.focus();
        }
    }
    onKeyUp = (e) => {
        if (e.key === 'Enter') {
            this.props.onUpdateTitle(this.props.id, this.state.editedTitle);
            this.setState({editing: false});
        } else if (e.key === 'Escape') {
            this.setState({editing: false});
        }
    }

    render() {
        const {id, title, onDeleteClicked} = this.props;
        return (
            <div className={styles.header}>
                {!this.state.editing && <span className={styles.title}>{title}</span>}
                {this.state.editing &&
                    <input
                        type='text'
                        value={this.state.editedTitle}
                        onChange={(e) => this.setState({editedTitle: e.target.value})}
                        onKeyUp={this.onKeyUp}
                        className={styles.titleInput}
                        ref={this.inputRef}
                    />
                }
                <i
                    className={'fa fa-pencil ' + styles.icon}
                    title='Edit lane'
                    onClick={() => this.setState({editing: true, editedTitle: title})}
                />
                <i
                    className={'fa fa-remove ' + styles.icon}
                    title='Remove lane'
                    onClick={() => onDeleteClicked(id)}
                />
            </div>
        );
    }
}

