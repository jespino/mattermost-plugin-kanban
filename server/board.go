package main

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/mattermost/mattermost-server/model"
	"github.com/mattermost/mattermost-server/plugin"
)

type Board struct {
	ID           string           `json:"id"`
	Lanes        map[string]*Lane `json:"lanes"`
	OrderedLanes []string         `json:"ordered_lanes"`
}

func (board *Board) ToJson() string {
	b, _ := json.Marshal(board)
	return string(b)
}

func BoardFromJson(data io.Reader) *Board {
	var board *Board
	json.NewDecoder(data).Decode(&board)
	return board
}

func (p *Plugin) handleGetBoard(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	err := p.validateRequest(c, r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	board, err := p.getBoardFromRequest(r)
	if err != nil {
		var err2 *model.AppError
		board, err2 = p.createEmptyBoard(c, r)
		if err2 != nil {
			w.WriteHeader(err2.StatusCode)
			w.Write([]byte(err2.Message))
			return
		}
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(board.ToJson()))
}
