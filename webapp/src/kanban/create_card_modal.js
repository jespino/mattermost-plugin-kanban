
import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import {Modal} from 'react-bootstrap';

export default class CreateCardModal extends Component {
    static propTypes = {
        onAdd: PropTypes.func.isReuquired,
        onCancel: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    updateField = (field, evt) => {
        this.setState({[field]: evt.target.value});
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
                            type='text'
                            value={this.state.title}
                            onChange={(evt) => this.updateField('title', evt)}
                            placeholder='Title'
                        />
                    </div>
                    <div>
                        <textarea
                            onChange={(evt) => this.updateField('description', evt)}
                            placeholder='Description'
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
                        {'Create'}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
