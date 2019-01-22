import React, {Component} from 'react';
import {PropTypes} from 'prop-types';

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
    }

    onKeyUp = (e) => {
        if (e.key === 'Enter') {
            this.props.onUpdateTitle(this.props.id, this.state.editedTitle);
            this.setState({editing: false});
        }
    }

    render() {
        const {id, title, onDeleteClicked} = this.props;
        return (
            <div style={{display: 'flex', alignItems: 'center'}}>
                {!this.state.editing && <span style={{flexGrow: 1, fontSize: '1.2em'}}>{title}</span>}
                {this.state.editing &&
                    <input
                        type='text'
                        value={this.state.editedTitle}
                        onChange={(e) => this.setState({editedTitle: e.target.value})}
                        onKeyUp={this.onKeyUp}
                        style={{flexGrow: 1, fontSize: '1.2em', border: 0, borderRadious: '3px'}}
                    />
                }
                <i
                    className='fa fa-pencil'
                    title='Edit lane'
                    onClick={() => this.setState({editing: true, editedTitle: title})}
                    style={{display: 'inline-block', marginLeft: '6px', cursor: 'pointer'}}
                />
                <i
                    className='fa fa-remove'
                    title='Remove lane'
                    onClick={() => onDeleteClicked(id)}
                    style={{display: 'inline-block', marginLeft: '6px', cursor: 'pointer'}}
                />
            </div>
        );
    }
}

