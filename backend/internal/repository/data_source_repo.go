package repository

import (
	"subscription-notification/internal/model"

	"gorm.io/gorm"
)

type DataSourceRepo interface {
	List() ([]model.DataSource, error)
	ListActive() ([]model.DataSource, error)
	GetByID(id string) (*model.DataSource, error)
	Create(ds *model.DataSource) error
	Update(ds *model.DataSource) error
	Delete(id string) error
}

type dataSourceRepo struct{ db *gorm.DB }

func NewDataSourceRepo(db *gorm.DB) DataSourceRepo {
	return &dataSourceRepo{db: db}
}

func (r *dataSourceRepo) List() ([]model.DataSource, error) {
	var rows []model.DataSource
	err := r.db.Order("created_at DESC").Find(&rows).Error
	return rows, err
}

func (r *dataSourceRepo) ListActive() ([]model.DataSource, error) {
	var rows []model.DataSource
	err := r.db.Where("is_active = ?", true).Find(&rows).Error
	return rows, err
}

func (r *dataSourceRepo) GetByID(id string) (*model.DataSource, error) {
	var ds model.DataSource
	err := r.db.First(&ds, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &ds, nil
}

func (r *dataSourceRepo) Create(ds *model.DataSource) error {
	return r.db.Create(ds).Error
}

func (r *dataSourceRepo) Update(ds *model.DataSource) error {
	return r.db.Save(ds).Error
}

func (r *dataSourceRepo) Delete(id string) error {
	return r.db.Delete(&model.DataSource{}, "id = ?", id).Error
}
