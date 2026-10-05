package handlers

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
	models "github.com/joao7834/IOT_Project/backEnd/Middleware/models"
)

func SqlConnect() *sql.DB {
	//usuario:senha@tcp(host:porta)/nome_do_banco?parametros
	dsn := "go_app:78347834@tcp(127.0.0.1:3306)/energy_logger?parseTime=true"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Falha ao se conectar com Banco de Dados. Servidor não consegue funcionar sem conexão SQL", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Falha ao se conectar com Banco de Dados. Servidor não consegue funcionar sem conexão SQL", err)
	}

	fmt.Println("Conexão com SQL estabelecida")
	return db
}

func InsertTel(db *sql.DB, t models.Telemetria) (int64, error) {
	res, err := db.Exec("INSERT INTO tbl_ltr (corrente, potencia, temperatura, umidade, esp_id) VALUES (?, ?, ?, ?, ?)",
		t.Corrente, t.Potencia, t.Temperatura, t.Umidade, t.EspID,
	)

	if err != nil {
		return 0, fmt.Errorf("Erro ao inserir telemetria ao SQL %w", err)
	}

	id, err := res.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("Erro ao descobrir id: %w", err)
	}
	return id, nil
}
