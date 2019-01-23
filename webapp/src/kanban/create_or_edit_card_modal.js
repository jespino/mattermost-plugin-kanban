
import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import {Modal} from 'react-bootstrap';

export default class CreateOrEditCardModal extends Component {
    static propTypes = {
        onAdd: PropTypes.func.isReuquired,
        onCancel: PropTypes.func.isRequired,
        card: PropTypes.object,
    }

    constructor(props) {
        super(props);
        if (props.card) {
            this.state = {
                id: props.card.id,
                laneId: props.card.laneId,
                title: props.card.title,
                description: props.card.description,
                metadata: {
                    tags: (props.card.metadata && props.card.metadata.tags) || [],
                },
            };
        } else {
            this.state = {
                metadata: {
                    tags: [],
                },
            };
        }
    }

    updateField = (field, evt) => {
        this.setState({[field]: evt.target.value});
    }

    updateTags = (evt) => {
        this.setState({metadata: {...this.state.metadata, tags: evt.target.value.split(',').map((s) => s.trim())}});
    }

    onCreateClicked = () => {
        this.props.onAdd(this.state);
    }

    onHide = () => {
        this.props.onCancel();
    }

    render() {
        return (
            <Modal
                show={true}
                onHide={this.onHide}
            >
                <Modal.Header
                    closeButton={true}
                >
                    <h4 className='modal-title'>
                        {'Create Card'}
                    </h4>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <input
                            style={{width: '100%', borderRadius: '3px', border: '1px solid #ccc', padding: '5px', marginBottom: '10px'}}
                            type='text'
                            value={this.state.title}
                            onChange={(evt) => this.updateField('title', evt)}
                            placeholder='Title'
                        />
                    </div>
                    <div>
                        <input
                            style={{width: '100%', borderRadius: '3px', border: '1px solid #ccc', padding: '5px', marginBottom: '10px'}}
                            type='text'
                            value={this.state.metadata.tags.join(',')}
                            onChange={this.updateTags}
                            placeholder='Tags'
                        />
                    </div>
                    <div>
                        <textarea
                            style={{width: '100%', borderRadius: '3px', border: '1px solid #ccc', padding: '5px'}}
                            onChange={(evt) => this.updateField('description', evt)}
                            value={this.state.description}
                            placeholder='Description'
                            rows={8}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-cancel'
                        onClick={this.onHide}
                    >
                        {'Cancel'}
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary'
                        onClick={this.onCreateClicked}
                    >
                        {this.props.card ? 'Edit' : 'Create'}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
