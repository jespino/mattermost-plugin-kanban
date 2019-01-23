import React, {Component} from 'react';
import {PropTypes} from 'prop-types';

export default class Card extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        laneId: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        label: PropTypes.string,
        onDeleteClicked: PropTypes.func,
        onEditClicked: PropTypes.func,
    }

    onDeleteClicked = () => {
        this.props.onDeleteClicked(this.props.id, this.props.laneId);
    }

    onEditClicked = () => {
        this.props.onEditClicked({
            id: this.props.id,
            laneId: this.props.laneId,
            title: this.props.title,
            description: this.props.description,
        });
    }

    render() {
        const {title, label, description, onDeleteClicked} = this.props;
        return (
            <div>
                <header
                    style={{
                        borderBottom: description ? '1px solid #eee' : 0,
                        padding: 5,
                        marginBottom: description ? 10 : 0,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{fontSize: 14, fontWeight: 'bold'}}>{title}</div>
                    {onDeleteClicked &&
                        <div style={{fontSize: 11}}>
                            <i
                                className='fa fa-pencil'
                                title='Remove card'
                                onClick={this.onEditClicked}
                                style={{marginLeft: '6px'}}
                            />
                            <i
                                className='fa fa-remove'
                                title='Remove card'
                                onClick={this.onDeleteClicked}
                                style={{marginLeft: '6px'}}
                            />
                        </div>}
                </header>
                {(description || label) &&
                    <div style={{fontSize: 12, color: '#BD3B36'}}>
                        {label && <div style={{fontSize: 11, backgroundColor: '#ccc', borderRadious: '5px'}}>{label}</div>}
                        {description &&
                            <div style={{padding: 5}}>
                                <i>{description}</i>
                            </div>}
                    </div>}
            </div>
        );
    }
}
