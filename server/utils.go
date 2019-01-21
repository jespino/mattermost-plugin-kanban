package main

import (
	"bytes"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost-server/model"
	"github.com/mattermost/mattermost-server/plugin"
)

func (p *Plugin) validateRequest(c *plugin.Context, r *http.Request) *model.AppError {
	vars := mux.Vars(r)
	channelID, channelOk := vars["channelId"]
	teamID, _ := vars["teamId"]
	session, err := p.API.GetSession(c.SessionId)
	if err != nil {
		return err
		// return model.NewAppError("kanban-plugin", "Invalid session", nil, "", http.StatusUnauthorized)
	}

	if session.UserId == "" {
		return model.NewAppError("kanban-plugin", "Login required", nil, "", http.StatusUnauthorized)
	}

	if channelOk {
		if !p.API.HasPermissionToChannel(session.UserId, channelID, model.PERMISSION_CREATE_POST) {
			return model.NewAppError("kanban-plugin", "Permission denied", nil, "", http.StatusForbidden)
		}
	} else {
		if !p.API.HasPermissionToTeam(session.UserId, teamID, model.PERMISSION_CREATE_POST) {
			return model.NewAppError("kanban-plugin", "Permission denied", nil, "", http.StatusForbidden)
		}
	}
	return nil
}

func (p *Plugin) getBoardFromRequest(r *http.Request) (*Board, *model.AppError) {
	vars := mux.Vars(r)
	channelID, channelOk := vars["channelId"]
	teamID, _ := vars["teamId"]

	var boardData []byte
	if channelOk {
		var err *model.AppError
		boardData, err = p.API.KVGet("channel-" + channelID)
		if err != nil {
			return nil, err
			// return nil, model.NewAppError("kanban-plugin", "Unable to read the board data", nil, "", http.StatusNotFound)
		}
	} else {
		var err *model.AppError
		boardData, err = p.API.KVGet("team-" + teamID)
		if err != nil {
			return nil, err
			// return nil, model.NewAppError("kanban-plugin", "Unable to read the board data", nil, "", http.StatusNotFound)
		}
	}
	board := BoardFromJson(bytes.NewReader(boardData))
	if board == nil {
		return nil, model.NewAppError("kanban-plugin", "Unable to decode the board data", nil, "", http.StatusInternalServerError)
	}
	return board, nil
}

func (p *Plugin) saveBoard(r *http.Request, board *Board) *model.AppError {
	vars := mux.Vars(r)
	channelID, channelOk := vars["channelId"]
	teamID, _ := vars["teamId"]

	if channelOk {
		err := p.API.KVSet("channel-"+channelID, []byte(board.ToJson()))
		if err != nil {
			return model.NewAppError("kanban-plugin", "Unable to save the board data", nil, "", http.StatusInternalServerError)
		}
	} else {
		err := p.API.KVSet("team-"+teamID, []byte(board.ToJson()))
		if err != nil {
			return model.NewAppError("kanban-plugin", "Unable to save the board data", nil, "", http.StatusInternalServerError)
		}
	}
	p.emitBoardChange(teamID, channelID, board.ID)
	return nil
}

func (p *Plugin) createEmptyBoard(c *plugin.Context, r *http.Request) (*Board, *model.AppError) {
	vars := mux.Vars(r)
	channelID, channelOk := vars["channelId"]
	teamID, _ := vars["teamId"]

	session, err := p.API.GetSession(c.SessionId)
	if err != nil {
		return nil, model.NewAppError("kanban-plugin", "Invalid session", nil, "", http.StatusUnauthorized)
	}

	todoLane := Lane{
		ID:           model.NewId(),
		Title:        "ToDo",
		Data:         nil,
		Cards:        make(map[string]*Card),
		Creator:      session.UserId,
		UpdatedAt:    time.Now().Unix(),
		CreatedAt:    time.Now().Unix(),
		OrderedCards: []string{},
	}

	doingLane := Lane{
		ID:           model.NewId(),
		Title:        "Doing",
		Data:         nil,
		Cards:        make(map[string]*Card),
		Creator:      session.UserId,
		UpdatedAt:    time.Now().Unix(),
		CreatedAt:    time.Now().Unix(),
		OrderedCards: []string{},
	}

	doneLane := Lane{
		ID:           model.NewId(),
		Title:        "Done",
		Data:         nil,
		Cards:        make(map[string]*Card),
		Creator:      session.UserId,
		UpdatedAt:    time.Now().Unix(),
		CreatedAt:    time.Now().Unix(),
		OrderedCards: []string{},
	}

	board := Board{
		ID:           model.NewId(),
		Lanes:        map[string]*Lane{todoLane.ID: &todoLane, doingLane.ID: &doingLane, doneLane.ID: &doneLane},
		OrderedLanes: []string{todoLane.ID, doingLane.ID, doneLane.ID},
	}

	if channelOk {
		err := p.API.KVSet("channel-"+channelID, []byte(board.ToJson()))
		if err != nil {
			return nil, model.NewAppError("kanban-plugin", "Unable to save the board data", nil, "", http.StatusInternalServerError)
		}
	} else {
		err := p.API.KVSet("team-"+teamID, []byte(board.ToJson()))
		if err != nil {
			return nil, model.NewAppError("kanban-plugin", "Unable to save the board data", nil, "", http.StatusInternalServerError)
		}
	}
	return &board, nil
}

func (p *Plugin) emitBoardChange(teamID, channelID, boardID string) {
	p.API.PublishWebSocketEvent("board_changed", map[string]interface{}{
		"boardId":   boardID,
		"teamId":    teamID,
		"channelId": channelID,
	}, &model.WebsocketBroadcast{})
}
