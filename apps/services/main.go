package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func main() {
	http.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(&w)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		fmt.Fprint(w, "pong")
	})

	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(&w)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var user User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, "invalid body", http.StatusBadRequest)
			return
		}

		if user.Username == "admin" && user.Password == "1234" {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]string{"message": "login success"})
			return
		}

		http.Error(w, "invalid credentials", http.StatusUnauthorized)
	})

	fmt.Println("Server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
