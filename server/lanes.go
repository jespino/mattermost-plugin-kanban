package main

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost-server/model"
	"github.com/mattermost/mattermost-server/plugin"
)

type LaneMovement struct {
	Position int `json:"position"`
}

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

func LaneMovementFromJson(data io.Reader) *LaneMovement {
	var laneMovement *LaneMovement
	json.NewDecoder(data).Decode(&laneMovement)
	return laneMovement
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
	lane.Cards = make(map[string]*Card, 0)
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

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(lane.ToJson()))
}

func (p *Plugin) handleLaneDelete(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	err := p.validateRequest(c, r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	vars := mux.Vars(r)
	laneID, laneOk := vars["laneId"]

	if !laneOk {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Lane not found"))
		return
	}

	board, err := p.getBoardFromRequest(r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	if _, ok := board.Lanes[laneID]; !ok {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Unable to delete lane: Lane not found"))
		return
	}
	delete(board.Lanes, laneID)
	newOrderedLanes := []string{}
	for _, orderedLaneID := range board.OrderedLanes {
		if orderedLaneID != laneID {
			newOrderedLanes = append(newOrderedLanes, orderedLaneID)
		}
	}
	board.OrderedLanes = newOrderedLanes

	err = p.saveBoard(r, board)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	w.WriteHeader(http.StatusNoContent)
	w.Write([]byte(""))
}

func (p *Plugin) handleLaneMove(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	err := p.validateRequest(c, r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	vars := mux.Vars(r)
	laneID, laneOk := vars["laneId"]

	if !laneOk {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Lane not found"))
		return
	}

	laneMovement := LaneMovementFromJson(r.Body)
	if laneMovement == nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid lane movement"))
		return
	}

	board, err := p.getBoardFromRequest(r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	newOrderedLanes := []string{}
	for _, orderedLaneID := range board.OrderedLanes {
		if orderedLaneID != laneID {
			newOrderedLanes = append(newOrderedLanes, orderedLaneID)
		}
	}
	board.OrderedLanes = append(newOrderedLanes[:laneMovement.Position], append([]string{laneID}, newOrderedLanes[laneMovement.Position:]...)...)

	err = p.saveBoard(r, board)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	w.WriteHeader(http.StatusNoContent)
	w.Write([]byte(""))
}
