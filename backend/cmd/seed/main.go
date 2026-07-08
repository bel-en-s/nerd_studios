package main

import (
	"fmt"
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"

	_ "nerdstudios/migrations"
)

type variantSpec struct {
	sku     string
	options map[string]any
	price   float64
	stock   float64
	weight  float64
}

type optionSpec struct {
	kind   string
	values []string
}

type productSpec struct {
	slug        string
	name        string
	description string
	category    string
	options     []optionSpec
	variants    []variantSpec
}

var seedProducts = []productSpec{
	// ─── ARRIBA ─────────────────────────────────
	{
		slug: "remera-basica", name: "Remera Basica Algodon",
		description: "<p>Remera unisex de algodon peinado 180gr. Corte regular.</p>",
		category:    "arriba",
		options: []optionSpec{
			{kind: "talla", values: []string{"S", "M", "L", "XL"}},
			{kind: "color", values: []string{"negro", "blanco", "gris"}},
		},
		variants: []variantSpec{
			{sku: "REM-NEG-S", options: map[string]any{"talla": "S", "color": "negro"}, price: 18500, stock: 10, weight: 180},
			{sku: "REM-NEG-M", options: map[string]any{"talla": "M", "color": "negro"}, price: 18500, stock: 15, weight: 180},
			{sku: "REM-NEG-L", options: map[string]any{"talla": "L", "color": "negro"}, price: 18500, stock: 12, weight: 180},
			{sku: "REM-BLA-M", options: map[string]any{"talla": "M", "color": "blanco"}, price: 18500, stock: 8, weight: 180},
			{sku: "REM-GRI-L", options: map[string]any{"talla": "L", "color": "gris"}, price: 18500, stock: 5, weight: 180},
		},
	},
	{
		slug: "campera-rompeviento", name: "Campera Rompeviento",
		description: "<p>Campera ligera rompeviento con capucha. Ideal para entretiempo.</p>",
		category:    "arriba",
		options: []optionSpec{
			{kind: "talla", values: []string{"S", "M", "L"}},
			{kind: "color", values: []string{"negro", "oliva"}},
		},
		variants: []variantSpec{
			{sku: "CMP-NEG-S", options: map[string]any{"talla": "S", "color": "negro"}, price: 65000, stock: 4, weight: 400},
			{sku: "CMP-NEG-M", options: map[string]any{"talla": "M", "color": "negro"}, price: 65000, stock: 7, weight: 400},
			{sku: "CMP-NEG-L", options: map[string]any{"talla": "L", "color": "negro"}, price: 65000, stock: 5, weight: 400},
			{sku: "CMP-OLI-M", options: map[string]any{"talla": "M", "color": "oliva"}, price: 68000, stock: 3, weight: 400},
		},
	},

	// ─── ABAJO ─────────────────────────────────
	{
		slug: "pantalon-cargo", name: "Pantalon Cargo",
		description: "<p>Pantalon cargo de tela resistente, 6 bolsillos. Corte recto.</p>",
		category:    "abajo",
		options: []optionSpec{
			{kind: "talla", values: []string{"S", "M", "L", "XL"}},
			{kind: "color", values: []string{"negro", "beige"}},
		},
		variants: []variantSpec{
			{sku: "CRG-NEG-S", options: map[string]any{"talla": "S", "color": "negro"}, price: 55000, stock: 5, weight: 500},
			{sku: "CRG-NEG-M", options: map[string]any{"talla": "M", "color": "negro"}, price: 55000, stock: 10, weight: 500},
			{sku: "CRG-NEG-L", options: map[string]any{"talla": "L", "color": "negro"}, price: 55000, stock: 8, weight: 500},
			{sku: "CRG-BEI-M", options: map[string]any{"talla": "M", "color": "beige"}, price: 55000, stock: 4, weight: 500},
			{sku: "CRG-BEI-L", options: map[string]any{"talla": "L", "color": "beige"}, price: 55000, stock: 3, weight: 500},
		},
	},
	{
		slug: "short-lino", name: "Short de Lino",
		description: "<p>Short holgado de lino. Corte recto, elastico en cintura.</p>",
		category:    "abajo",
		options: []optionSpec{
			{kind: "talla", values: []string{"S", "M", "L"}},
			{kind: "color", values: []string{"beige", "negro"}},
		},
		variants: []variantSpec{
			{sku: "SHO-BEI-S", options: map[string]any{"talla": "S", "color": "beige"}, price: 32000, stock: 6, weight: 200},
			{sku: "SHO-BEI-M", options: map[string]any{"talla": "M", "color": "beige"}, price: 32000, stock: 10, weight: 200},
			{sku: "SHO-BEI-L", options: map[string]any{"talla": "L", "color": "beige"}, price: 32000, stock: 7, weight: 200},
			{sku: "SHO-NEG-M", options: map[string]any{"talla": "M", "color": "negro"}, price: 32000, stock: 5, weight: 200},
		},
	},

	// ─── CENTRO ────────────────────────────────
	{
		slug: "vestido-negro", name: "Vestido Negro",
		description: "<p>Vestido negro de algodon. Corte recto, largo midi.</p>",
		category:    "centro",
		options: []optionSpec{
			{kind: "talla", values: []string{"S", "M", "L"}},
		},
		variants: []variantSpec{
			{sku: "VST-NEG-S", options: map[string]any{"talla": "S"}, price: 48000, stock: 4, weight: 250},
			{sku: "VST-NEG-M", options: map[string]any{"talla": "M"}, price: 48000, stock: 8, weight: 250},
			{sku: "VST-NEG-L", options: map[string]any{"talla": "L"}, price: 48000, stock: 5, weight: 250},
		},
	},
}

func main() {
	app := pocketbase.New()
	if err := app.Bootstrap(); err != nil {
		log.Fatalf("bootstrap: %v", err)
	}

	productsCol, _ := app.FindCollectionByNameOrId("products")
	optionsCol, _ := app.FindCollectionByNameOrId("product_options")
	variantsCol, _ := app.FindCollectionByNameOrId("product_variants")

	for _, p := range seedProducts {
		existing, _ := app.FindFirstRecordByFilter("products", "slug = {:slug}", map[string]any{"slug": p.slug})
		if existing != nil {
			fmt.Printf("  %-22s ya existe, skip\n", p.slug)
			continue
		}

		pr := core.NewRecord(productsCol)
		pr.Set("slug", p.slug)
		pr.Set("name", p.name)
		pr.Set("description", p.description)
		pr.Set("category", p.category)
		pr.Set("active", true)
		app.Save(pr)

		for _, o := range p.options {
			or := core.NewRecord(optionsCol)
			or.Set("product", pr.Id)
			or.Set("kind", o.kind)
			or.Set("values", o.values)
			app.Save(or)
		}

		for _, v := range p.variants {
			vr := core.NewRecord(variantsCol)
			vr.Set("product", pr.Id)
			vr.Set("sku", v.sku)
			vr.Set("options", v.options)
			vr.Set("price_ars", v.price)
			vr.Set("stock", v.stock)
			vr.Set("weight_g", v.weight)
			vr.Set("active", true)
			app.Save(vr)
		}

		fmt.Printf("✓ %-22s [%s] -> %d variantes\n", p.slug, p.category, len(p.variants))
	}
	fmt.Println("\nSeed completo.")
}
