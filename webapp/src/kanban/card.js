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
    }

    onDeleteClicked = () => {
        this.props.onDeleteClicked(this.props.id, this.props.laneId);
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
                        <div
                            style={{fontSize: 11}}
                            onClick={this.onDeleteClicked}
                        >
                            <i
                                className='fa fa-remove'
                                title='Remove card'
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
