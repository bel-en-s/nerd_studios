package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("product_variants")
		if err != nil {
			return err
		}

		collection.Fields.Add(&core.FileField{
			Name: "images", MaxSelect: 8, MaxSize: 5 * 1024 * 1024,
			MimeTypes: []string{"image/jpeg", "image/png", "image/webp", "image/avif"},
		})

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("product_variants")
		if err != nil {
			return err
		}

		collection.Fields.RemoveByName("images")

		return app.Save(collection)
	})
}
