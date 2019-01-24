import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import sha1 from 'js-sha1';

import styles from './card.css';

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
        onDeleteClicked: PropTypes.func.isRequired,
        onEditClicked: PropTypes.func.isRequired,
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
        const {title, metadata, description} = this.props;
        return (
            <div className={styles.card}>
                <header className={description ? styles.headerWithDescription : styles.header}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.icons}>
                        <i
                            className='fa fa-pencil'
                            title='Remove card'
                            onClick={this.onEditClicked}
                        />
                        <i
                            className='fa fa-remove'
                            title='Remove card'
                            onClick={this.onDeleteClicked}
                        />
                    </div>
                </header>
                {(description || metadata.tags) &&
                    <div className={styles.body}>
                        {description &&
                            <div className={styles.description}>
                                <i>{description}</i>
                            </div>}
                        {metadata.tags && metadata.tags.length > 0 &&
                            <div className={styles.tags}>
                                {metadata.tags.map((tag) => (
                                    <div
                                        key={tag}
                                        style={{backgroundColor: tagToColor(tag)}}
                                    >
                                        {tag}
                                    </div>
                                ))}
                            </div>}
                    </div>}
            </div>
        );
    }
}
