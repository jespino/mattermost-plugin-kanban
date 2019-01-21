package main

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/mattermost/mattermost-server/model"
	"github.com/mattermost/mattermost-server/plugin"
)

type Lane struct {
	ID           string           `json:"id"`
	Title        string           `json:"title"`
	Data         json.RawMessage  `json:"data"`
	Cards        map[string]*Card `json:"cards"`
	Creator      string           `json:"creator"`
	UpdatedAt    int64            `json:"updated_at"`
	CreatedAt    int64            `json:"created_at"`
	OrderedCards []string         `json:"ordered_cards"`
}

func (lane *Lane) ToJson() string {
	b, _ := json.Marshal(lane)
	return string(b)
}

func LaneFromJson(data io.Reader) *Lane {
	var lane *Lane
	json.NewDecoder(data).Decode(&lane)
	return lane
}

func (p *Plugin) handleLaneCreate(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	err := p.validateRequest(c, r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	session, err := p.API.GetSession(c.SessionId)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Invalid session"))
		return
	}

	lane := LaneFromJson(r.Body)
	if lane == nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid lane"))
		return
	}

	board, err := p.getBoardFromRequest(r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	lane.ID = model.NewId()
	lane.CreatedAt = time.Now().Unix()
	lane.UpdatedAt = time.Now().Unix()
	lane.Creator = session.UserId
	board.Lanes[lane.ID] = lane
	board.OrderedLanes = append(board.OrderedLanes, lane.ID)

	err = p.saveBoard(r, board)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(lane.ToJson()))
}

func (p *Plugin) handleLaneUpdate(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	err := p.validateRequest(c, r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	lane := LaneFromJson(r.Body)
	if lane == nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid lane"))
		return
	}

	board, err := p.getBoardFromRequest(r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	if _, ok := board.Lanes[lane.ID]; !ok {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Unable to update lane: Lane not found"))
		return
	}
	lane.UpdatedAt = time.Now().Unix()
	board.Lanes[lane.ID] = lane

	err = p.saveBoard(r, board)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(lane.ToJson()))
}

func (p *Plugin) handleLaneDelete(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	err := p.validateRequest(c, r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	lane := LaneFromJson(r.Body)
	if lane == nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid lane"))
		return
	}

	board, err := p.getBoardFromRequest(r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	if _, ok := board.Lanes[lane.ID]; !ok {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Unable to delete lane: Lane not found"))
		return
	}
	delete(board.Lanes, lane.ID)
	newOrderedLanes := []string{}
	for _, laneID := range board.OrderedLanes {
		if laneID != lane.ID {
			newOrderedLanes = append(newOrderedLanes, laneID)
		}
	}
	board.OrderedLanes = newOrderedLanes

	err = p.saveBoard(r, board)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(lane.ToJson()))
}
