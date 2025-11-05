package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
        enableCORS(&w)

        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusNoContent)
            return
        }

                fmt.Fprint(w, "pong")
    })

    fmt.Println("Server running on http://localhost:8080")
    http.ListenAndServe(":8080", nil)
}

func enableCORS(w *http.ResponseWriter) {
    (*w).Header().Set("Access-Control-Allow-Origin", "*")
    (*w).Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
    (*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
