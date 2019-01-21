package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost-server/plugin"
)

type APIErrorResponse struct {
	ID         string `json:"id"`
	Message    string `json:"message"`
	StatusCode int    `json:"status_code"`
}

func writeAPIError(w http.ResponseWriter, err *APIErrorResponse) {
	b, _ := json.Marshal(err)
	w.WriteHeader(err.StatusCode)
	w.Write(b)
}

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	router := mux.NewRouter()
	router.HandleFunc("/channel/{channelId}/card", func(w http.ResponseWriter, r *http.Request) { p.handleCardCreate(c, w, r) }).Methods("POST")
	router.HandleFunc("/channel/{channelId}/card", func(w http.ResponseWriter, r *http.Request) { p.handleCardUpdate(c, w, r) }).Methods("PUT")
	router.HandleFunc("/channel/{channelId}/card", func(w http.ResponseWriter, r *http.Request) { p.handleCardDelete(c, w, r) }).Methods("DELETE")
	router.HandleFunc("/team/{teamId}/card", func(w http.ResponseWriter, r *http.Request) { p.handleCardCreate(c, w, r) }).Methods("POST")
	router.HandleFunc("/team/{teamId}/card", func(w http.ResponseWriter, r *http.Request) { p.handleCardUpdate(c, w, r) }).Methods("PUT")
	router.HandleFunc("/team/{teamId}/card", func(w http.ResponseWriter, r *http.Request) { p.handleCardDelete(c, w, r) }).Methods("DELETE")
	router.HandleFunc("/channel/{channelId}/lane", func(w http.ResponseWriter, r *http.Request) { p.handleCardCreate(c, w, r) }).Methods("POST")
	router.HandleFunc("/channel/{channelId}/lane", func(w http.ResponseWriter, r *http.Request) { p.handleCardUpdate(c, w, r) }).Methods("PUT")
	router.HandleFunc("/channel/{channelId}/lane", func(w http.ResponseWriter, r *http.Request) { p.handleCardDelete(c, w, r) }).Methods("DELETE")
	router.HandleFunc("/team/{teamId}/lane", func(w http.ResponseWriter, r *http.Request) { p.handleCardCreate(c, w, r) }).Methods("POST")
	router.HandleFunc("/team/{teamId}/lane", func(w http.ResponseWriter, r *http.Request) { p.handleCardUpdate(c, w, r) }).Methods("PUT")
	router.HandleFunc("/team/{teamId}/lane", func(w http.ResponseWriter, r *http.Request) { p.handleCardDelete(c, w, r) }).Methods("DELETE")
	router.HandleFunc("/{channelId}", func(w http.ResponseWriter, r *http.Request) { p.handleGetBoard(c, w, r) }).Methods("GET")
	w.Header().Set("Content-Type", "application/json")
	router.ServeHTTP(w, r)
}
