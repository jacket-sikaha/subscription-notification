package controller

import (
	"net/http"

	"subscription-notification/internal/model"
	"subscription-notification/internal/service"

	"github.com/gin-gonic/gin"
)

type SubscriptionController struct {
	svc *service.SubscriptionService
}

func NewSubscriptionController(svc *service.SubscriptionService) *SubscriptionController {
	return &SubscriptionController{svc: svc}
}

func (c *SubscriptionController) List(ctx *gin.Context) {
	rows, err := c.svc.List()
	if err != nil {
		ctx.JSON(http.StatusOK, model.Error(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, model.Success(rows))
}

func (c *SubscriptionController) GetByID(ctx *gin.Context) {
	id := ctx.Param("id")
	sub, err := c.svc.GetByID(id)
	if err != nil {
		ctx.JSON(http.StatusOK, model.Error("subscription not found"))
		return
	}
	ctx.JSON(http.StatusOK, model.Success(sub))
}

func (c *SubscriptionController) Create(ctx *gin.Context) {
	var sub model.Subscription
	if err := ctx.ShouldBindJSON(&sub); err != nil {
		ctx.JSON(http.StatusOK, model.Error("invalid request: "+err.Error()))
		return
	}
	if err := c.svc.Create(&sub); err != nil {
		ctx.JSON(http.StatusOK, model.Error(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, model.Success(sub))
}

func (c *SubscriptionController) Update(ctx *gin.Context) {
	id := ctx.Param("id")
	var sub model.Subscription
	if err := ctx.ShouldBindJSON(&sub); err != nil {
		ctx.JSON(http.StatusOK, model.Error("invalid request: "+err.Error()))
		return
	}
	sub.ID = id
	if err := c.svc.Update(&sub); err != nil {
		ctx.JSON(http.StatusOK, model.Error(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, model.Success(nil))
}

func (c *SubscriptionController) Delete(ctx *gin.Context) {
	id := ctx.Param("id")
	if err := c.svc.Delete(id); err != nil {
		ctx.JSON(http.StatusOK, model.Error(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, model.Success(nil))
}
