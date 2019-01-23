import {id as pluginId} from './manifest';

export const getBoard = (state) => (state['plugins-' + pluginId] || {}).board || null;
export const isTeamAppActive = (state) => (state['plugins-' + pluginId] || {}).active === 'team';
export const isChannelAppActive = (state) => (state['plugins-' + pluginId] || {}).active === 'channel';
