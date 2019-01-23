import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import sha1 from 'js-sha1';

function tagToColor(tag) {
    const hash = sha1(tag).slice(0, 6);
    return '#' + hash.replace('8', '0').replace('9', '1').replace('a', '2').replace('b', '3').replace('c', '4').replace('d', '5').replace('e', '6').replace('f', '7');
}

export default class Card extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        laneId: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        label: PropTypes.string,
        metadata: PropTypes.object,
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
            metadata: this.props.metadata,
        });
    }

    render() {
        const {title, metadata, description, onDeleteClicked} = this.props;
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
                {(description || metadata.tags) &&
                    <div style={{fontSize: 12, color: '#BD3B36'}}>
                        {description &&
                            <div style={{padding: 5}}>
                                <i>{description}</i>
                            </div>}
                        {metadata.tags && metadata.tags.length > 0 &&
                            <div style={{display: 'flex', margin: 5}}>
                                {metadata.tags.map((tag) => (
                                    <div style={{fontSize: 11, padding: '5px', marginRight: '5px', backgroundColor: tagToColor(tag), color: 'white', borderRadius: '5px'}}>{tag}</div>
                                ))}
                            </div>}
                    </div>}
            </div>
        );
    }
}
