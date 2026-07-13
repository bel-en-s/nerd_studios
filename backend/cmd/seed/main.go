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
	label       string
	options     []optionSpec
	variants    []variantSpec
}

var seedProducts = []productSpec{
	// ─── TOPS ──────────────────────────────────
	{
		slug: "remera-basica", name: "Remera Basica Algodon",
		description: "<p>Remera unisex de algodon peinado 180gr. Corte regular.</p>",
		category:    "tops",
		label:       "ready_to_ship",
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
		slug: "vestido-negro", name: "Vestido Negro",
		description: "<p>Vestido negro de algodon. Corte recto, largo midi.</p>",
		category:    "tops",
		label:       "made_to_order",
		options: []optionSpec{
			{kind: "talla", values: []string{"S", "M", "L"}},
		},
		variants: []variantSpec{
			{sku: "VST-NEG-S", options: map[string]any{"talla": "S"}, price: 48000, stock: 4, weight: 250},
			{sku: "VST-NEG-M", options: map[string]any{"talla": "M"}, price: 48000, stock: 8, weight: 250},
			{sku: "VST-NEG-L", options: map[string]any{"talla": "L"}, price: 48000, stock: 5, weight: 250},
		},
	},

	// ─── OUTERWEAR ─────────────────────────────
	{
		slug: "campera-rompeviento", name: "Campera Rompeviento",
		description: "<p>Campera ligera rompeviento con capucha. Ideal para entretiempo.</p>",
		category:    "outerwear",
		label:       "ready_to_ship",
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

	// ─── BOTTOMS ───────────────────────────────
	{
		slug: "pantalon-cargo", name: "Pantalon Cargo",
		description: "<p>Pantalon cargo de tela resistente, 6 bolsillos. Corte recto.</p>",
		category:    "bottoms",
		label:       "ready_to_ship",
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
		category:    "bottoms",
		label:       "ready_to_ship",
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

	// ─── ACCESSORIES ───────────────────────────
	{
		slug: "gorra-nerd", name: "Gorra Nerd Studios",
		description: "<p>Gorra de algodon con bordado frontal. Ajuste con tira metalica.</p>",
		category: "accessories",
		label:    "ready_to_ship",
		options: []optionSpec{
			{kind: "color", values: []string{"negro", "blanco"}},
		},
		variants: []variantSpec{
			{sku: "GOR-NEG", options: map[string]any{"color": "negro"}, price: 22000, stock: 12, weight: 100},
			{sku: "GOR-BLA", options: map[string]any{"color": "blanco"}, price: 22000, stock: 8, weight: 100},
		},
	},
	{
		slug: "bolsa-tote", name: "Bolsa Tote Algodon",
		description: "<p>Bolsa tote de algodon crudo con estampa serigrafica.</p>",
		category: "accessories",
		label:    "ready_to_ship",
		options: []optionSpec{
			{kind: "color", values: []string{"crudo", "negro"}},
		},
		variants: []variantSpec{
			{sku: "TOT-CRU", options: map[string]any{"color": "crudo"}, price: 15000, stock: 20, weight: 80},
			{sku: "TOT-NEG", options: map[string]any{"color": "negro"}, price: 15000, stock: 15, weight: 80},
		},
	},

	// ─── ONE OF ONE ────────────────────────────
	{
		slug: "buzo-pintado", name: "Buzo Pintado a Mano",
		description: "<p>Buzo oversized intervenido a mano con pintura textil. Pieza unica.</p>",
		category: "tops",
		label:    "one_of_one",
		options: []optionSpec{
			{kind: "talla", values: []string{"M", "L"}},
		},
		variants: []variantSpec{
			{sku: "BPM-M", options: map[string]any{"talla": "M"}, price: 85000, stock: 1, weight: 550},
			{sku: "BPM-L", options: map[string]any{"talla": "L"}, price: 85000, stock: 0, weight: 550},
		},
	},

	// ─── MORE TOPS ─────────────────────────────
	{
		slug: "musculosa-deporte", name: "Musculosa Deporte",
		description: "<p>Musculosa de algodon jersey 200gr. Corte holgado ideal para capas.</p>",
		category: "tops",
		label:    "ready_to_ship",
		options: []optionSpec{
			{kind: "talla", values: []string{"S", "M", "L"}},
			{kind: "color", values: []string{"negro", "blanco"}},
		},
		variants: []variantSpec{
			{sku: "MUS-NEG-S", options: map[string]any{"talla": "S", "color": "negro"}, price: 15000, stock: 12, weight: 140},
			{sku: "MUS-NEG-M", options: map[string]any{"talla": "M", "color": "negro"}, price: 15000, stock: 18, weight: 140},
			{sku: "MUS-NEG-L", options: map[string]any{"talla": "L", "color": "negro"}, price: 15000, stock: 10, weight: 140},
			{sku: "MUS-BLA-M", options: map[string]any{"talla": "M", "color": "blanco"}, price: 15000, stock: 8, weight: 140},
		},
	},
	{
		slug: "camisa-oversize", name: "Camisa Oversize Algodon",
		description: "<p>Camisa de corte oversized en algodon liviano. Botones de resina.</p>",
		category: "tops",
		label:    "made_to_order",
		options: []optionSpec{
			{kind: "talla", values: []string{"M", "L", "XL"}},
			{kind: "color", values: []string{"blanco", "celeste"}},
		},
		variants: []variantSpec{
			{sku: "CMS-BLA-M", options: map[string]any{"talla": "M", "color": "blanco"}, price: 52000, stock: 0, weight: 300},
			{sku: "CMS-BLA-L", options: map[string]any{"talla": "L", "color": "blanco"}, price: 52000, stock: 0, weight: 300},
			{sku: "CMS-CEL-L", options: map[string]any{"talla": "L", "color": "celeste"}, price: 52000, stock: 0, weight: 300},
			{sku: "CMS-CEL-XL", options: map[string]any{"talla": "XL", "color": "celeste"}, price: 55000, stock: 0, weight: 310},
		},
	},

	// ─── MORE OUTERWEAR ─────────────────────────
	{
		slug: "buzo-canguro", name: "Buzo Canguro Fleece",
		description: "<p>Buzo canguro de fleece 320gr. Bolsillo canguro, capucha forrada.</p>",
		category: "outerwear",
		label:    "ready_to_ship",
		options: []optionSpec{
			{kind: "talla", values: []string{"S", "M", "L", "XL"}},
			{kind: "color", values: []string{"negro", "gris", "verde"}},
		},
		variants: []variantSpec{
			{sku: "BZO-NEG-S", options: map[string]any{"talla": "S", "color": "negro"}, price: 78000, stock: 6, weight: 600},
			{sku: "BZO-NEG-M", options: map[string]any{"talla": "M", "color": "negro"}, price: 78000, stock: 10, weight: 600},
			{sku: "BZO-NEG-L", options: map[string]any{"talla": "L", "color": "negro"}, price: 78000, stock: 8, weight: 600},
			{sku: "BZO-NEG-XL", options: map[string]any{"talla": "XL", "color": "negro"}, price: 78000, stock: 4, weight: 650},
			{sku: "BZO-GRI-M", options: map[string]any{"talla": "M", "color": "gris"}, price: 78000, stock: 7, weight: 600},
			{sku: "BZO-GRI-L", options: map[string]any{"talla": "L", "color": "gris"}, price: 78000, stock: 5, weight: 600},
			{sku: "BZO-VER-M", options: map[string]any{"talla": "M", "color": "verde"}, price: 82000, stock: 3, weight: 600},
		},
	},
	{
		slug: "chaleco-acolchado", name: "Chaleco Acolchado",
		description: "<p>Chaleco acolchado ligero. Ideal para capa intermedia.</p>",
		category: "outerwear",
		label:    "ready_to_ship",
		options: []optionSpec{
			{kind: "talla", values: []string{"M", "L"}},
			{kind: "color", values: []string{"negro", "oliva"}},
		},
		variants: []variantSpec{
			{sku: "CHL-NEG-M", options: map[string]any{"talla": "M", "color": "negro"}, price: 58000, stock: 4, weight: 350},
			{sku: "CHL-NEG-L", options: map[string]any{"talla": "L", "color": "negro"}, price: 58000, stock: 6, weight: 350},
			{sku: "CHL-OLI-M", options: map[string]any{"talla": "M", "color": "oliva"}, price: 58000, stock: 3, weight: 350},
		},
	},

	// ─── MORE BOTTOMS ──────────────────────────
	{
		slug: "jean-recto", name: "Jean Recto",
		description: "<p>Jean de corte recto en denim elastizado. Cierre frontal.</p>",
		category: "bottoms",
		label:    "made_to_order",
		options: []optionSpec{
			{kind: "talla", values: []string{"S", "M", "L", "XL"}},
			{kind: "color", values: []string{"indigo", "negro"}},
		},
		variants: []variantSpec{
			{sku: "JEA-IND-S", options: map[string]any{"talla": "S", "color": "indigo"}, price: 65000, stock: 0, weight: 550},
			{sku: "JEA-IND-M", options: map[string]any{"talla": "M", "color": "indigo"}, price: 65000, stock: 0, weight: 550},
			{sku: "JEA-IND-L", options: map[string]any{"talla": "L", "color": "indigo"}, price: 65000, stock: 0, weight: 550},
			{sku: "JEA-NEG-M", options: map[string]any{"talla": "M", "color": "negro"}, price: 65000, stock: 0, weight: 550},
			{sku: "JEA-NEG-L", options: map[string]any{"talla": "L", "color": "negro"}, price: 65000, stock: 0, weight: 550},
		},
	},
	{
		slug: "bermuda-cargo", name: "Bermuda Cargo",
		description: "<p>Bermuda cargo de tela resistente. 4 bolsillos, corte regular.</p>",
		category: "bottoms",
		label:    "ready_to_ship",
		options: []optionSpec{
			{kind: "talla", values: []string{"S", "M", "L"}},
			{kind: "color", values: []string{"negro", "beige"}},
		},
		variants: []variantSpec{
			{sku: "BER-NEG-S", options: map[string]any{"talla": "S", "color": "negro"}, price: 38000, stock: 7, weight: 350},
			{sku: "BER-NEG-M", options: map[string]any{"talla": "M", "color": "negro"}, price: 38000, stock: 12, weight: 350},
			{sku: "BER-NEG-L", options: map[string]any{"talla": "L", "color": "negro"}, price: 38000, stock: 8, weight: 350},
			{sku: "BER-BEI-M", options: map[string]any{"talla": "M", "color": "beige"}, price: 38000, stock: 5, weight: 350},
		},
	},

	// ─── MORE ACCESSORIES ──────────────────────
	{
		slug: "rinonera-nylon", name: "Riñonera Nylon",
		description: "<p>Riñonera de nylon resistente al agua. Compartimento principal con cierre.</p>",
		category: "accessories",
		label:    "ready_to_ship",
		options: []optionSpec{
			{kind: "color", values: []string{"negro", "verde", "naranja"}},
		},
		variants: []variantSpec{
			{sku: "RIN-NEG", options: map[string]any{"color": "negro"}, price: 28000, stock: 15, weight: 120},
			{sku: "RIN-VER", options: map[string]any{"color": "verde"}, price: 28000, stock: 8, weight: 120},
			{sku: "RIN-NAR", options: map[string]any{"color": "naranja"}, price: 28000, stock: 5, weight: 120},
		},
	},
	{
		slug: "bandana-estampada", name: "Bandana Estampada",
		description: "<p>Bandana de seda estampada. 55x55cm. Diseno exclusivo.</p>",
		category: "accessories",
		label:    "ready_to_ship",
		options: []optionSpec{
			{kind: "color", values: []string{"negro/blanco", "rojo/crema"}},
		},
		variants: []variantSpec{
			{sku: "BND-NBJ", options: map[string]any{"color": "negro/blanco"}, price: 12000, stock: 20, weight: 30},
			{sku: "BND-RCJ", options: map[string]any{"color": "rojo/crema"}, price: 12000, stock: 14, weight: 30},
		},
	},

	// ─── MORE ONE OF ONE ───────────────────────
	{
		slug: "campera-patchwork", name: "Campera Patchwork",
		description: "<p>Campera unica confeccionada con retazos de denim reciclado. Cada pieza es irrepetible.</p>",
		category: "outerwear",
		label:    "one_of_one",
		options: []optionSpec{
			{kind: "talla", values: []string{"M"}},
		},
		variants: []variantSpec{
			{sku: "PTW-M", options: map[string]any{"talla": "M"}, price: 120000, stock: 1, weight: 800},
		},
	},

	// ─── MORE ARCHIVE RENTAL ───────────────────
	{
		slug: "conjunto-archivo", name: "Conjunto Archivo 2022",
		description: "<p>Conjunto de dos piezas de archivo. Campera y pantalon con tratamiento textil experimental.</p><p>Disponible solo para rental.</p>",
		category:    "archive_rental",
		label:       "archive_rental",
		options: []optionSpec{
			{kind: "talla", values: []string{"M", "L"}},
		},
		variants: []variantSpec{
			{sku: "ARC-CJT-M", options: map[string]any{"talla": "M"}, price: 35000, stock: 1, weight: 900},
			{sku: "ARC-CJT-L", options: map[string]any{"talla": "L"}, price: 35000, stock: 1, weight: 900},
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
		pr.Set("label", p.label)
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
