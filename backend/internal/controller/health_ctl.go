package controller

import (
	"net/http"

	"subscription-notification/internal/model"

	"github.com/gin-gonic/gin"
)

func HealthCheck(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, model.Success(map[string]string{"status": "ok"}))
}
