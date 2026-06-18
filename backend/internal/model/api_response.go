package model

// ApiResponse 统一后端响应格式 —— code=0 成功，其他为业务错误
type ApiResponse struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

func Success(data interface{}) ApiResponse {
	return ApiResponse{Code: 0, Msg: "success", Data: data}
}

func Error(msg string) ApiResponse {
	return ApiResponse{Code: 1, Msg: msg}
}
