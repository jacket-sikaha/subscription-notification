package pkg

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/tidwall/gjson"
)

var httpClient = &http.Client{Timeout: 30 * time.Second}

// FetchResult 从 API 端点抓取并解析后的结果
type FetchResult struct {
	RawBody string
	Parsed  string // 经 parsePath 提取后的值
}

// FetchAndExtract 向指定端点发起 HTTP 请求，并用 GJSON 路径提取目标字段值
func FetchAndExtract(method, endpoint, headersJSON, bodyTemplate, parsePath string) (*FetchResult, error) {
	var body io.Reader
	if bodyTemplate != "" {
		body = strings.NewReader(bodyTemplate)
	}

	req, err := http.NewRequest(method, endpoint, body)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	// 解析 JSON headers
	if headersJSON != "" && headersJSON != "{}" {
		var headers map[string]string
		if err := json.Unmarshal([]byte(headersJSON), &headers); err == nil {
			for k, v := range headers {
				req.Header.Set(k, v)
			}
		}
	}

	if req.Header.Get("Content-Type") == "" && bodyTemplate != "" {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http do: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read body: %w", err)
	}

	rawBody := string(respBytes)
	parsed := gjson.Get(rawBody, parsePath).String()

	return &FetchResult{RawBody: rawBody, Parsed: parsed}, nil
}
