package pkg

import (
	"fmt"
	"log/slog"

	gomail "gopkg.in/gomail.v2"
)

// Notifier 邮件通知器
type Notifier struct {
	Host     string
	Port     int
	Username string
	Password string
}

func NewNotifier(host string, port int, username, password string) *Notifier {
	return &Notifier{Host: host, Port: port, Username: username, Password: password}
}

// SendEmail 发送通知邮件
func (n *Notifier) SendEmail(to, subject, body string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", n.Username)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)

	d := gomail.NewDialer(n.Host, n.Port, n.Username, n.Password)

	if err := d.DialAndSend(m); err != nil {
		slog.Error("send email failed", "to", to, "subject", subject, "error", err)
		return fmt.Errorf("send email: %w", err)
	}

	slog.Info("email sent", "to", to, "subject", subject)
	return nil
}
