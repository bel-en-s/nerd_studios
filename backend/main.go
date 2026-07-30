package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	"nerdstudios/internal/handlers"
	_ "nerdstudios/migrations"
)

func main() {
	godotenv.Load()

	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangGo,
		Automigrate:  true,
		Dir:          "migrations",
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST("/checkout", handlers.CheckoutHandler)
		se.Router.GET("/ping", func(e *core.RequestEvent) error {
			return e.String(200, "pong")
		})
		log.Println("Rutas /checkout y /ping registradas")
		return se.Next()
	})

	if len(os.Args) == 1 {
		os.Args = append(os.Args, "serve", "--dev")
	}

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
