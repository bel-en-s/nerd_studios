package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		products := core.NewBaseCollection("products")
		products.Fields.Add(&core.TextField{Name: "slug", Required: true, Max: 120})
		products.Fields.Add(&core.TextField{Name: "name", Required: true, Max: 200})
		products.Fields.Add(&core.EditorField{Name: "description"})
		products.Fields.Add(&core.SelectField{
			Name: "category", Required: true, MaxSelect: 1,
			Values: []string{"arriba", "abajo", "centro"},
		})
		products.Fields.Add(&core.BoolField{Name: "active"})
		products.Fields.Add(&core.FileField{
			Name: "images", MaxSelect: 8, MaxSize: 5 * 1024 * 1024,
			MimeTypes: []string{"image/jpeg", "image/png", "image/webp", "image/avif"},
		})
		products.Fields.Add(&core.AutodateField{Name: "created", OnCreate: true})
		products.Fields.Add(&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true})
		products.AddIndex("idx_products_slug", true, "slug", "")
		products.AddIndex("idx_products_active", false, "active", "")
		products.ListRule = strPtr("active = true")
		products.ViewRule = strPtr("active = true")
		if err := app.Save(products); err != nil {
			return err
		}

		options := core.NewBaseCollection("product_options")
		options.Fields.Add(&core.RelationField{
			Name: "product", Required: true, MaxSelect: 1,
			CollectionId: products.Id, CascadeDelete: true,
		})
		options.Fields.Add(&core.SelectField{
			Name: "kind", Required: true, MaxSelect: 1,
			Values: []string{"talla", "color", "estilo"},
		})
		options.Fields.Add(&core.JSONField{Name: "values", Required: true, MaxSize: 4 * 1024})
		options.AddIndex("idx_options_product_kind", true, "product, kind", "")
		if err := app.Save(options); err != nil {
			return err
		}

		variants := core.NewBaseCollection("product_variants")
		variants.Fields.Add(&core.RelationField{
			Name: "product", Required: true, MaxSelect: 1,
			CollectionId: products.Id, CascadeDelete: true,
		})
		variants.Fields.Add(&core.TextField{Name: "sku", Required: true, Max: 80})
		variants.Fields.Add(&core.JSONField{Name: "options", MaxSize: 2 * 1024})
		variants.Fields.Add(&core.NumberField{Name: "price_ars", Required: true, Min: floatPtr(0)})
		variants.Fields.Add(&core.NumberField{Name: "stock", OnlyInt: true, Min: floatPtr(0)})
		variants.Fields.Add(&core.NumberField{Name: "weight_g", OnlyInt: true, Min: floatPtr(0)})
		variants.Fields.Add(&core.BoolField{Name: "active"})
		variants.AddIndex("idx_variants_sku", true, "sku", "")
		variants.AddIndex("idx_variants_product", false, "product", "")
		variants.ListRule = strPtr("active = true && product.active = true")
		variants.ViewRule = strPtr("active = true && product.active = true")
		if err := app.Save(variants); err != nil {
			return err
		}

		return nil
	}, func(app core.App) error {
		for _, name := range []string{
			"product_variants", "product_options", "products",
		} {
			c, err := app.FindCollectionByNameOrId(name)
			if err != nil {
				continue
			}
			if err := app.Delete(c); err != nil {
				return err
			}
		}
		return nil
	})
}

func strPtr(s string) *string { return &s }
func floatPtr(f float64) *float64 { return &f }
