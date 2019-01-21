import {combineReducers} from 'redux';

import {BOARD_CHANGED} from './action_types';

const board = (state = null, action) => {
    switch (action.type) {
    case BOARD_CHANGED:
        console.log(action.data)
        return action.data;

    default:
        return state;
    }
};

export default combineReducers({
    board,
});

