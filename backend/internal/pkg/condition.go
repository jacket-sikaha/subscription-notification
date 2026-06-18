package pkg

import (
	"fmt"
	"strconv"
	"strings"
)

// ConditionType 条件类型枚举
type ConditionType string

const (
	CondLT       ConditionType = "lt"
	CondGT       ConditionType = "gt"
	CondEQ       ConditionType = "eq"
	CondContains ConditionType = "contains"
)

// Evaluate 判断 currentValue 是否满足指定条件
func Evaluate(condType, currentValue, conditionValue string) bool {
	switch ConditionType(condType) {
	case CondLT:
		cv, err1 := strconv.ParseFloat(currentValue, 64)
		tv, err2 := strconv.ParseFloat(conditionValue, 64)
		if err1 != nil || err2 != nil {
			return false
		}
		return cv < tv
	case CondGT:
		cv, err1 := strconv.ParseFloat(currentValue, 64)
		tv, err2 := strconv.ParseFloat(conditionValue, 64)
		if err1 != nil || err2 != nil {
			return false
		}
		return cv > tv
	case CondEQ:
		return currentValue == conditionValue
	case CondContains:
		return strings.Contains(currentValue, conditionValue)
	default:
		return false
	}
}

// Describe 返回条件的人类可读描述
func Describe(condType, conditionValue string) string {
	switch ConditionType(condType) {
	case CondLT:
		return fmt.Sprintf("< %s", conditionValue)
	case CondGT:
		return fmt.Sprintf("> %s", conditionValue)
	case CondEQ:
		return fmt.Sprintf("= %s", conditionValue)
	case CondContains:
		return fmt.Sprintf("contains \"%s\"", conditionValue)
	default:
		return fmt.Sprintf("? %s", conditionValue)
	}
}
