package main

import (
	"os"
	"html/template"
    "log"
    "net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Message struct {
	ID           string    `json:"id"`
	Content      string    `json:"message"`
	ReceiverUUID string    `json:"receiverUuid"`
	Timestamp    time.Time `json:"timestamp"`
}

var messages = make(map[string][]Message)

func main() {
	r := gin.Default()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

    fs := http.FileServer(http.Dir("static"))
    http.Handle("/static/", http.StripPrefix("/static/", fs))

    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        tmpl, err := template.ParseFiles("templates/index.html")
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        tmpl.Execute(w, nil)
    })

    log.Println("Server is running on http://localhost:8080")
    http.ListenAndServe(":8080", nil)

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/generate-uuid", func(c *gin.Context) {
		newUUID := uuid.New().String()
		c.JSON(200, gin.H{"uuid": newUUID})
	})

	r.POST("/messages", func(c *gin.Context) {
		var newMessage Message
		if err := c.BindJSON(&newMessage); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		newMessage.ID = uuid.New().String()
		newMessage.Timestamp = time.Now()

		messages[newMessage.ReceiverUUID] = append(messages[newMessage.ReceiverUUID], newMessage)
		c.JSON(200, newMessage)
	})

	r.GET("/messages/:uuid", func(c *gin.Context) {
		uuid := c.Param("uuid")
		if userMessages, exists := messages[uuid]; exists {
			c.JSON(200, userMessages)
		} else {
			c.JSON(200, []Message{})
		}
	})

	r.DELETE("/messages/:id", func(c *gin.Context) {
		messageID := c.Param("id")

		for uuid, userMessages := range messages {
			for i, msg := range userMessages {
				if msg.ID == messageID {
					messages[uuid] = append(userMessages[:i], userMessages[i+1:]...)
					c.JSON(200, gin.H{"message": "ลบข้อความสำเร็จ"})
					return
				}
			}
		}

		c.JSON(404, gin.H{"error": "ไม่พบข้อความที่ต้องการลบ"})
	})

	r.Run(":8080")
}
