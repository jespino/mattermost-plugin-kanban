
import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import {Modal} from 'react-bootstrap';

export default class CreateLaneModal extends Component {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        onCreate: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            laneName: '',
        };
    }

    setLaneName = (e) => {
        this.setState({laneName: e.target.value});
    }

    onCreateClicked = () => {
        this.props.onCreate(this.state.laneName);
        this.props.onClose();
        this.setState({laneName: ''});
    }

    onHide = () => {
        this.setState({laneName: ''});
        this.props.onClose();
    }

    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.onHide}
            >
                <Modal.Header
                    closeButton={true}
                >
                    <h4 className='modal-title'>
                        {'Create Lane'}
                    </h4>
                </Modal.Header>
                <Modal.Body>
                    <label htmlFor='create-lane-input'>{'Name: '}</label>
                    <input
                        id='create-lane-input'
                        type='text'
                        onChange={this.setLaneName}
                        value={this.state.laneName}
                    />
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
