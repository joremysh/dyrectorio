package grpc_test

import (
	"github.com/dyrector-io/dyrectorio/agent/internal/grpc"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestGrpcTokenToConnectionParams(t *testing.T) {
	// pass a valid jwt token
	grpcToken := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
	_, err := grpc.GrpcTokenToConnectionParams(grpcToken, true)
	assert.Nil(t, err)

	// pass an invalid jwt token should fail
	_, err = grpc.GrpcTokenToConnectionParams("dummy_token", true)
	assert.Error(t, err)
}
