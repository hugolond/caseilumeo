package models

import "time"

type UsersSurveysResponsesAux struct {
	ID               int64     `json:"id" db:"id"`
	Origin           string    `json:"origin" db:"origin"`
	ResponseStatusId int16     `json:"response_status_id" db:"response_status_id"`
	CreatedAt        time.Time `json:"created_at,omitempty" db:"created_at"`
}
