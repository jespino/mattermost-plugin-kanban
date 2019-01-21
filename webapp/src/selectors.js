import {id as pluginId} from './manifest';

export const getBoard = (state) => (state['plugins-' + pluginId] || {}).board || null;
