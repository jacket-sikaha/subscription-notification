package service

import (
	"errors"

	"subscription-notification/internal/model"
	"subscription-notification/internal/repository"

	"gorm.io/gorm"
)

type DataSourceService struct {
	repo repository.DataSourceRepo
}

func NewDataSourceService(repo repository.DataSourceRepo) *DataSourceService {
	return &DataSourceService{repo: repo}
}

func (s *DataSourceService) List() ([]model.DataSource, error) {
	return s.repo.List()
}

func (s *DataSourceService) ListActive() ([]model.DataSource, error) {
	return s.repo.ListActive()
}

func (s *DataSourceService) GetByID(id string) (*model.DataSource, error) {
	return s.repo.GetByID(id)
}

func (s *DataSourceService) Create(ds *model.DataSource) error {
	if ds.Name == "" || ds.Endpoint == "" || ds.ParsePath == "" || ds.CronSchedule == "" {
		return errors.New("name, endpoint, parse_path and cron_schedule are required")
	}
	return s.repo.Create(ds)
}

func (s *DataSourceService) Update(ds *model.DataSource) error {
	existing, err := s.repo.GetByID(ds.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("data source not found")
		}
		return err
	}
	existing.Name = ds.Name
	existing.Endpoint = ds.Endpoint
	existing.Method = ds.Method
	existing.Headers = ds.Headers
	existing.BodyTemplate = ds.BodyTemplate
	existing.ParsePath = ds.ParsePath
	existing.CronSchedule = ds.CronSchedule
	existing.IsActive = ds.IsActive
	return s.repo.Update(existing)
}

func (s *DataSourceService) Delete(id string) error {
	return s.repo.Delete(id)
}
