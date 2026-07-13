package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_4092854851")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(5, []byte(`{
			"hidden": false,
			"id": "select245846248",
			"maxSelect": 1,
			"name": "label",
			"presentable": false,
			"required": true,
			"system": false,
			"type": "select",
			"values": [
				"made_to_order",
				"ready_to_ship",
				"one_of_one",
				"archive_rental"
			]
		}`)); err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(4, []byte(`{
			"hidden": false,
			"id": "select105650625",
			"maxSelect": 1,
			"name": "category",
			"presentable": false,
			"required": true,
			"system": false,
			"type": "select",
			"values": [
				"tops",
				"outerwear",
				"bottoms",
				"accessories",
				"archive_rental"
			]
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_4092854851")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("select245846248")

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(4, []byte(`{
			"hidden": false,
			"id": "select105650625",
			"maxSelect": 1,
			"name": "category",
			"presentable": false,
			"required": true,
			"system": false,
			"type": "select",
			"values": [
				"arriba",
				"abajo",
				"centro"
			]
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
