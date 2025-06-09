package pkg

import (
	models "backend/model"
	db "backend/prisma/prisma-client"
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func OpenConn() (*sql.DB, error) {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println(err)
	}
	var database = os.Getenv("DATABASE_URL")

	db, err := sql.Open("postgres", database)
	if err != nil {
		fmt.Println(err)
		panic(err)
	}
	err = db.Ping()
	return db, err
}

func InsertInside(inside models.UsersSurveysResponsesAux) error {
	conn, err := OpenConn()
	if err != nil {
		return err
	}
	defer conn.Close()

	sqlStatement :=
		`INSERT INTO inside.users_surveys_responses_aux (id, origin, response_status_id, created_at)
  			VALUES ($1, $2, $3, $4)`

	_, err = conn.Exec(sqlStatement, inside.ID, inside.Origin, inside.ResponseStatusId, inside.CreatedAt)
	if err != nil {
		return fmt.Errorf("erro ao inserir registro: %w", err)
	}
	return err
}

func GetInside(origin string) ([]models.UsersSurveysResponsesAux, error) {
	conn, err := OpenConn()
	if err != nil {
		return nil, fmt.Errorf("erro ao abrir conexão: %w", err)
	}
	defer conn.Close()

	sqlStatement := `
		SELECT id, origin, response_status_id, created_at FROM inside.users_surveys_responses_aux WHERE origin = $1`

	rows, err := conn.Query(sqlStatement, origin)
	if err != nil {
		return nil, fmt.Errorf("erro ao executar query: %w", err)
	}
	defer rows.Close()

	var insides []models.UsersSurveysResponsesAux
	for rows.Next() {
		var u models.UsersSurveysResponsesAux
		err := rows.Scan(
			&u.ID,
			&u.Origin,
			&u.ResponseStatusId,
			&u.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("erro ao ler linha: %w", err)
		}
		insides = append(insides, u)
	}

	return insides, nil
}
func GetConversaoByOriginDate(origin string, startDate, endDate time.Time) ([]db.ConversionRateByDayChannelModel, error) {
	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		log.Println("Erro ao conectar prisma:", err)
		return nil, err
	}

	defer func() {
		if err := client.Prisma.Disconnect(); err != nil {
			panic(err)
		}
	}()

	ctx := context.Background()
	result, err := client.ConversionRateByDayChannel.FindMany(
		db.ConversionRateByDayChannel.Channel.Contains(origin),
		db.ConversionRateByDayChannel.Date.Gte(startDate),
		db.ConversionRateByDayChannel.Date.Lte(endDate),
	).Exec(ctx)

	return result, err
}
