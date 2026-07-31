package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/pocketbase/pocketbase/core"
)

type cartItem struct {
	Sku      string `json:"sku"`
	Name     string `json:"name"`
	Price    int    `json:"price"`
	Quantity int    `json:"quantity"`
}

type checkoutRequest struct {
	Items    []cartItem     `json:"items"`
	Shipping *checkoutShipping `json:"shipping,omitempty"`
}

type checkoutShipping struct {
	Cost         int    `json:"cost"`
	DeliveryType string `json:"deliveryType"`
	Agency       string `json:"agency,omitempty"`
	RecipientName  string `json:"recipientName"`
	RecipientEmail string `json:"recipientEmail"`
	PostalCode     string `json:"postalCode"`
	StreetName     string `json:"streetName,omitempty"`
	StreetNumber   string `json:"streetNumber,omitempty"`
	City           string `json:"city,omitempty"`
	ProvinceCode   string `json:"provinceCode,omitempty"`
}

type mpItem struct {
	Title      string  `json:"title"`
	Quantity   int     `json:"quantity"`
	UnitPrice  float64 `json:"unit_price"`
	CurrencyID string  `json:"currency_id"`
}

type mpBackURLs struct {
	Success string `json:"success"`
	Failure string `json:"failure"`
	Pending string `json:"pending"`
}

type mpPreferenceRequest struct {
	Items    []mpItem   `json:"items"`
	BackURLs mpBackURLs `json:"back_urls"`
}

type mpPreferenceResponse struct {
	ID        string `json:"id"`
	InitPoint string `json:"init_point"`
}

func CheckoutHandler(e *core.RequestEvent) error {
	if e.Request.Method != "POST" {
		return e.String(405, "Method not allowed")
	}

	body, err := io.ReadAll(e.Request.Body)
	if err != nil {
		return e.String(400, "Bad request")
	}

	var req checkoutRequest
	if err := json.Unmarshal(body, &req); err != nil {
		return e.String(400, "Invalid JSON")
	}

	if len(req.Items) == 0 {
		return e.String(400, "Cart is empty")
	}

	accessToken := os.Getenv("MERCADOPAGO_ACCESS_TOKEN")
	if accessToken == "" {
		return e.String(500, "Payment not configured")
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	mpItems := make([]mpItem, 0, len(req.Items)+1)
	for _, item := range req.Items {
		mpItems = append(mpItems, mpItem{
			Title:      item.Name,
			Quantity:   item.Quantity,
			UnitPrice:  float64(item.Price),
			CurrencyID: "ARS",
		})
	}

	if req.Shipping != nil && req.Shipping.Cost > 0 {
		mpItems = append(mpItems, mpItem{
			Title:      "Envio - Correo Argentino",
			Quantity:   1,
			UnitPrice:  float64(req.Shipping.Cost),
			CurrencyID: "ARS",
		})
	}

	mpReq := mpPreferenceRequest{
		Items: mpItems,
		BackURLs: mpBackURLs{
			Success: frontendURL + "/shop.html?status=success",
			Failure: frontendURL + "/shop.html?status=failure",
			Pending: frontendURL + "/shop.html?status=pending",
		},
	}

	mpBody, err := json.Marshal(mpReq)
	if err != nil {
		return e.String(500, "Failed to encode request")
	}

	httpReq, err := http.NewRequest("POST", "https://api.mercadopago.com/checkout/preferences", bytes.NewReader(mpBody))
	if err != nil {
		return e.String(500, "Failed to create request")
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return e.String(500, "Payment service unavailable")
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return e.String(resp.StatusCode, string(respBody))
	}

	var mpResp mpPreferenceResponse
	json.Unmarshal(respBody, &mpResp)

	return e.JSON(200, map[string]string{
		"init_point": mpResp.InitPoint,
	})
}
