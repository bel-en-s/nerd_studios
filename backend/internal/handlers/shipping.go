package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/pocketbase/pocketbase/core"
)

var (
	caToken        string
	caTokenExpiry  time.Time
	caTokenMu      sync.Mutex
)

func getCorreoArgentinoToken() (string, error) {
	caTokenMu.Lock()
	defer caTokenMu.Unlock()

	if caToken != "" && time.Now().Before(caTokenExpiry) {
		return caToken, nil
	}

	baseURL := os.Getenv("CORREO_ARGENTINO_BASE_URL")
	if baseURL == "" {
		baseURL = "https://apitest.correoargentino.com.ar/micorreo/v1"
	}

	user := os.Getenv("CORREO_ARGENTINO_USER")
	password := os.Getenv("CORREO_ARGENTINO_PASSWORD")

	req, err := http.NewRequest("POST", baseURL+"/token", nil)
	if err != nil {
		return "", err
	}
	req.SetBasicAuth(user, password)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("correo argentino auth failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("correo argentino auth returned %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		Token   string `json:"token"`
		Expires string `json:"expires"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("failed to parse token response: %w", err)
	}

	caToken = result.Token

	if result.Expires != "" {
		t, err := time.Parse("2006-01-02 15:04:05", result.Expires)
		if err == nil {
			caTokenExpiry = t.Add(-5 * time.Minute)
		} else {
			caTokenExpiry = time.Now().Add(55 * time.Minute)
		}
	} else {
		caTokenExpiry = time.Now().Add(55 * time.Minute)
	}

	return caToken, nil
}

func caBaseURL() string {
	base := os.Getenv("CORREO_ARGENTINO_BASE_URL")
	if base == "" {
		base = "https://apitest.correoargentino.com.ar/micorreo/v1"
	}
	return base
}

func caCustomerID() string {
	return os.Getenv("CORREO_ARGENTINO_CUSTOMER_ID")
}

func proxyToCA(method, path string, body []byte) (int, []byte, error) {
	token, err := getCorreoArgentinoToken()
	if err != nil {
		return 500, nil, err
	}

	url := caBaseURL() + path
	req, err := http.NewRequest(method, url, bytes.NewReader(body))
	if err != nil {
		return 500, nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 20 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return 500, nil, fmt.Errorf("correo argentino request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	return resp.StatusCode, respBody, nil
}

func ShippingRatesHandler(e *core.RequestEvent) error {
	if e.Request.Method != "POST" {
		return e.JSON(405, map[string]string{"error": "Method not allowed"})
	}

	body, err := io.ReadAll(e.Request.Body)
	if err != nil {
		return e.JSON(400, map[string]string{"error": "Bad request"})
	}

	var req map[string]interface{}
	if err := json.Unmarshal(body, &req); err != nil {
		return e.JSON(400, map[string]string{"error": "Invalid JSON"})
	}

	if _, ok := req["customerId"]; !ok {
		cid := caCustomerID()
		if cid != "" {
			req["customerId"] = cid
		}
	}

	caBody, _ := json.Marshal(req)
	status, respBody, err := proxyToCA("POST", "/rates", caBody)
	if err != nil {
		return e.JSON(500, map[string]string{"error": err.Error()})
	}

	return e.String(status, string(respBody))
}

func ShippingAgenciesHandler(e *core.RequestEvent) error {
	if e.Request.Method != "GET" {
		return e.JSON(405, map[string]string{"error": "Method not allowed"})
	}

	customerID := e.Request.URL.Query().Get("customerId")
	if customerID == "" {
		customerID = caCustomerID()
	}
	provinceCode := e.Request.URL.Query().Get("provinceCode")

	if provinceCode == "" {
		return e.JSON(400, map[string]string{"error": "provinceCode is required"})
	}

	path := fmt.Sprintf("/agencies?customerId=%s&provinceCode=%s", customerID, provinceCode)
	status, respBody, err := proxyToCA("GET", path, nil)
	if err != nil {
		return e.JSON(500, map[string]string{"error": err.Error()})
	}

	return e.String(status, string(respBody))
}

func ShippingImportHandler(e *core.RequestEvent) error {
	if e.Request.Method != "POST" {
		return e.JSON(405, map[string]string{"error": "Method not allowed"})
	}

	body, err := io.ReadAll(e.Request.Body)
	if err != nil {
		return e.JSON(400, map[string]string{"error": "Bad request"})
	}

	var req map[string]interface{}
	if err := json.Unmarshal(body, &req); err != nil {
		return e.JSON(400, map[string]string{"error": "Invalid JSON"})
	}

	if _, ok := req["customerId"]; !ok {
		cid := caCustomerID()
		if cid != "" {
			req["customerId"] = cid
		}
	}

	caBody, _ := json.Marshal(req)
	status, respBody, err := proxyToCA("POST", "/shipping/import", caBody)
	if err != nil {
		return e.JSON(500, map[string]string{"error": err.Error()})
	}

	return e.String(status, string(respBody))
}

func ShippingTrackingHandler(e *core.RequestEvent) error {
	if e.Request.Method != "POST" {
		return e.JSON(405, map[string]string{"error": "Method not allowed"})
	}

	body, err := io.ReadAll(e.Request.Body)
	if err != nil {
		return e.JSON(400, map[string]string{"error": "Bad request"})
	}

	var req map[string]interface{}
	if err := json.Unmarshal(body, &req); err != nil {
		return e.JSON(400, map[string]string{"error": "Invalid JSON"})
	}

	caBody, _ := json.Marshal(req)
	status, respBody, err := proxyToCA("GET", "/shipping/tracking", caBody)
	if err != nil {
		return e.JSON(500, map[string]string{"error": err.Error()})
	}

	return e.String(status, string(respBody))
}
