package main

import (
	"log"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	_ "nerdstudios/migrations"
)

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangGo,
		Automigrate:  true,
		Dir:          "migrations",
	})

	if len(os.Args) == 1 {
		os.Args = append(os.Args, "serve", "--dev")
	}

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
