package controller

import (
	"net/http"

	"subscription-notification/internal/model"
	"subscription-notification/internal/service"

	"github.com/gin-gonic/gin"
)

type DataSourceController struct {
	svc *service.DataSourceService
}

func NewDataSourceController(svc *service.DataSourceService) *DataSourceController {
	return &DataSourceController{svc: svc}
}

func (c *DataSourceController) List(ctx *gin.Context) {
	rows, err := c.svc.List()
	if err != nil {
		ctx.JSON(http.StatusOK, model.Error(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, model.Success(rows))
}

func (c *DataSourceController) GetByID(ctx *gin.Context) {
	id := ctx.Param("id")
	ds, err := c.svc.GetByID(id)
	if err != nil {
		ctx.JSON(http.StatusOK, model.Error("data source not found"))
		return
	}
	ctx.JSON(http.StatusOK, model.Success(ds))
}

func (c *DataSourceController) Create(ctx *gin.Context) {
	var ds model.DataSource
	if err := ctx.ShouldBindJSON(&ds); err != nil {
		ctx.JSON(http.StatusOK, model.Error("invalid request: "+err.Error()))
		return
	}
	if err := c.svc.Create(&ds); err != nil {
		ctx.JSON(http.StatusOK, model.Error(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, model.Success(ds))
}

func (c *DataSourceController) Update(ctx *gin.Context) {
	id := ctx.Param("id")
	var ds model.DataSource
	if err := ctx.ShouldBindJSON(&ds); err != nil {
		ctx.JSON(http.StatusOK, model.Error("invalid request: "+err.Error()))
		return
	}
	ds.ID = id
	if err := c.svc.Update(&ds); err != nil {
		ctx.JSON(http.StatusOK, model.Error(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, model.Success(nil))
}

func (c *DataSourceController) Delete(ctx *gin.Context) {
	id := ctx.Param("id")
	if err := c.svc.Delete(id); err != nil {
		ctx.JSON(http.StatusOK, model.Error(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, model.Success(nil))
}
