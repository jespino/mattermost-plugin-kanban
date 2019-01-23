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

type CardMovement struct {
	SourceLaneID string `json:"sourceLaneId"`
	TargetLaneID string `json:"targetLaneId"`
	Position     int    `json:"position"`
}

type Card struct {
	ID          string          `json:"id"`
	LaneID      string          `json:"lane_id"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	Creator     string          `json:"creator"`
	UpdatedAt   int64           `json:"updated_at"`
	CreatedAt   int64           `json:"created_at"`
	Data        json.RawMessage `json:"data"`
}

func (card *Card) ToJson() string {
	b, _ := json.Marshal(card)
	return string(b)
}

func CardFromJson(data io.Reader) *Card {
	var card *Card
	json.NewDecoder(data).Decode(&card)
	return card
}

func CardMovementFromJson(data io.Reader) *CardMovement {
	var cardMovement *CardMovement
	json.NewDecoder(data).Decode(&cardMovement)
	return cardMovement
}

func (p *Plugin) handleCardCreate(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	err := p.validateRequest(c, r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	session, err := p.API.GetSession(c.SessionId)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	card := CardFromJson(r.Body)
	if card == nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid card"))
		return
	}

	board, err := p.getBoardFromRequest(r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	card.ID = model.NewId()
	card.CreatedAt = time.Now().Unix()
	card.UpdatedAt = time.Now().Unix()
	card.Creator = session.UserId
	board.Lanes[card.LaneID].Cards[card.ID] = card
	board.Lanes[card.LaneID].OrderedCards = append(board.Lanes[card.LaneID].OrderedCards, card.ID)

	err = p.saveBoard(r, board)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(card.ToJson()))
}

func (p *Plugin) handleCardUpdate(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	err := p.validateRequest(c, r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	card := CardFromJson(r.Body)
	if card == nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid card"))
		return
	}

	board, err := p.getBoardFromRequest(r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	if _, ok := board.Lanes[card.LaneID]; !ok {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Unable to update card: Card not found"))
		return
	}

	if _, ok := board.Lanes[card.LaneID].Cards[card.ID]; !ok {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Unable to update card: Card not found"))
		return
	}
	card.UpdatedAt = time.Now().Unix()
	board.Lanes[card.LaneID].Cards[card.ID] = card

	err = p.saveBoard(r, board)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(card.ToJson()))
}

func (p *Plugin) handleCardDelete(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	err := p.validateRequest(c, r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	vars := mux.Vars(r)
	cardID, cardOk := vars["cardId"]
	laneID, laneOk := vars["laneId"]

	if !cardOk || !laneOk {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Card not found"))
		return
	}

	board, err := p.getBoardFromRequest(r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	if _, ok := board.Lanes[laneID].Cards[cardID]; !ok {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Unable to delete card: Card not found"))
		return
	}
	delete(board.Lanes[laneID].Cards, cardID)
	newOrderedCards := []string{}
	for _, orderedCardID := range board.Lanes[laneID].OrderedCards {
		if orderedCardID != cardID {
			newOrderedCards = append(newOrderedCards, orderedCardID)
		}
	}
	board.Lanes[laneID].OrderedCards = newOrderedCards

	err = p.saveBoard(r, board)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	w.WriteHeader(http.StatusNoContent)
	w.Write([]byte(""))
}

func (p *Plugin) handleCardMove(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	err := p.validateRequest(c, r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	vars := mux.Vars(r)
	cardID, cardOk := vars["cardId"]

	if !cardOk {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Card not found"))
		return
	}

	cardMovement := CardMovementFromJson(r.Body)
	if cardMovement == nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid card movement"))
		return
	}

	board, err := p.getBoardFromRequest(r)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	card, ok := board.Lanes[cardMovement.SourceLaneID].Cards[cardID]
	card.UpdatedAt = time.Now().Unix()
	card.LaneID = cardMovement.TargetLaneID
	if !ok {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Unable to move card: Card not found"))
		return
	}
	delete(board.Lanes[cardMovement.SourceLaneID].Cards, cardID)

	newOrderedCards := []string{}
	for _, orderedCardID := range board.Lanes[cardMovement.SourceLaneID].OrderedCards {
		if orderedCardID != cardID {
			newOrderedCards = append(newOrderedCards, orderedCardID)
		}
	}
	board.Lanes[cardMovement.SourceLaneID].OrderedCards = newOrderedCards

	board.Lanes[cardMovement.TargetLaneID].Cards[cardID] = card

	newTargetOrderedCards := board.Lanes[cardMovement.TargetLaneID].OrderedCards
	newTargetOrderedCards = append(newTargetOrderedCards[:cardMovement.Position], append([]string{cardID}, newTargetOrderedCards[cardMovement.Position:]...)...)
	board.Lanes[cardMovement.TargetLaneID].OrderedCards = newTargetOrderedCards

	err = p.saveBoard(r, board)
	if err != nil {
		w.WriteHeader(err.StatusCode)
		w.Write([]byte(err.Message))
		return
	}

	w.WriteHeader(http.StatusNoContent)
	w.Write([]byte(""))
}
