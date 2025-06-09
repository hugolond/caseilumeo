package src

import (
	models "backend/model"
	"backend/pkg"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func Healthz(c *gin.Context) {
	post := gin.H{
		"message": "Ok",
	}
	c.JSON(http.StatusOK, post)

}
func InsertInside(c *gin.Context) {
	var inside models.UsersSurveysResponsesAux

	if err := c.ShouldBindJSON(&inside); err != nil {
		log.Println("Erro ao fazer bind do JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "JSON inválido"})
		return
	}
	currentTime := time.Now()
	fmt.Printf("[GIN] %s | CA - Insert dados inside: %d\n", currentTime.Format("2006/01/02 - 15:04:05"), inside.ID)
	if err := pkg.InsertInside(inside); err != nil {
		log.Println("Erro ao inserir inside:", err.Error())

		if strings.Contains(err.Error(), "duplicate key value") {
			c.JSON(http.StatusConflict, gin.H{"error": "Registro com esse ID já existe"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"message": "Erro ao registrar inside"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Inside cadastrado com sucesso!"})
}

func GetInside(c *gin.Context) {
	origin := c.Param("origin")

	if origin == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'origin' é obrigatório"})
		return
	}
	result, err := pkg.GetInside(origin)
	if err != nil {
		log.Println("Erro ao consultar origin:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao consultar Origen"})
		return
	}
	c.JSON(http.StatusOK, result)
}

func GetConversaoByOriginDate(c *gin.Context) {
	origin := c.Param("origin")
	startDateStr := c.Query("start")
	endDateStr := c.Query("end")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'start' inválido. Use YYYY-MM-DD"})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'end' inválido. Use YYYY-MM-DD"})
		return
	}

	if origin == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'origin' é obrigatório"})
		return
	}
	result, err := pkg.GetConversaoByOriginDate(origin, startDate, endDate)
	if err != nil {
		log.Println("Erro ao consultar origin:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao consultar Origen"})
		return
	}
	c.JSON(http.StatusOK, result)
}
