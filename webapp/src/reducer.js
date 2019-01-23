import {combineReducers} from 'redux';

import {BOARD_CHANGED, SET_APP_ACTIVE, UNSET_BOARD} from './action_types';

const board = (state = null, action) => {
    switch (action.type) {
    case BOARD_CHANGED:
        return action.data;

    case UNSET_BOARD:
        return null;

    default:
        return state;
    }
};

const active = (state = false, action) => {
    switch (action.type) {
    case SET_APP_ACTIVE:
        return action.data;

    default:
        return state;
    }
};

export default combineReducers({
    board,
    active,
});

