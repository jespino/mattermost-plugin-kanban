
import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import {Modal} from 'react-bootstrap';

export default class CreateLaneModal extends Component {
    static propTypes = {
        title: PropTypes.bool.isRequired,
        text: PropTypes.bool.isRequired,
        show: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        onAccept: PropTypes.func.isRequired,
    }

    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onClose}
            >
                <Modal.Header
                    closeButton={true}
                >
                    <h4 className='modal-title'>
                        {this.props.title}
                    </h4>
                </Modal.Header>
                <Modal.Body>
                    {this.props.text}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-cancel'
                        onClick={this.props.onClose}
                    >
                        {'No'}
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary'
                        onClick={this.props.onAccept}
                    >
                        {'Yes'}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
