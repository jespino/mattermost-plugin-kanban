import React, {Component} from 'react';
import {PropTypes} from 'prop-types';

export default class Card extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        label: PropTypes.string,
    }

    render() {
        const {title, label, description} = this.props;
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
                    <div style={{fontSize: 11}}>{label}</div>
                </header>
                {description &&
                    <div style={{fontSize: 12, color: '#BD3B36'}}>
                        <div style={{padding: 5}}>
                            <i>{description}</i>
                        </div>
                    </div>}
            </div>
        );
    }
}
