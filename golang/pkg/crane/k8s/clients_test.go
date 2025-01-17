//go:build unit
// +build unit

package k8s_test

import (
	"errors"
	"testing"
	"time"

	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/config"
	"github.com/dyrector-io/dyrectorio/golang/pkg/crane/k8s"

	"github.com/stretchr/testify/assert"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

func TestGetClientSetInCluster(t *testing.T) {
	// GIVEN
	cfg := &config.Configuration{
		CraneInCluster:     true,
		DefaultKubeTimeout: time.Second,
	}
	callCount := 0
	client := k8s.NewClient()
	client.InClusterConfig = func() (*rest.Config, error) {
		callCount = callCount + 1
		return &rest.Config{}, nil
	}

	// WHEN
	resultClient, _ := client.GetClientSet(cfg)

	// THEN
	assert.NotNil(t, resultClient)
	assert.Equal(t, 1, callCount)
}

func TestGetClientSetInClusterError(t *testing.T) {
	// GIVEN
	cfg := &config.Configuration{
		CraneInCluster:     true,
		DefaultKubeTimeout: time.Second,
	}
	client := k8s.NewClient()
	client.InClusterConfig = func() (*rest.Config, error) {
		return nil, errors.New("InCluster error")
	}

	// WHEN
	resultClient, err := client.GetClientSet(cfg)

	// THEN
	assert.Equal(t, (*kubernetes.Clientset)(nil), resultClient)
	assert.Equal(t, errors.New("InCluster error"), err)
}

func TestGetClientSetOutCluster(t *testing.T) {
	// GIVEN
	cfg := &config.Configuration{
		CraneInCluster:     false,
		DefaultKubeTimeout: time.Second,
	}
	client := k8s.NewClient()
	client.BuildConfigFromFlags = func(_, _ string) (*rest.Config, error) {
		return &rest.Config{}, nil
	}

	// WHEN
	resultClient, _ := client.GetClientSet(cfg)

	// THEN
	assert.NotNil(t, resultClient)
}

func TestGetClientSetOutClusterError(t *testing.T) {
	// GIVEN
	cfg := &config.Configuration{
		CraneInCluster:     false,
		DefaultKubeTimeout: time.Second,
		KubeConfig:         "test_kubeconfig",
	}
	client := k8s.NewClient()
	client.BuildConfigFromFlags = func(_, _ string) (*rest.Config, error) {
		return nil, errors.New("OutCluster error")
	}

	// WHEN

	// THEN
	assert.PanicsWithValue(t, "Could not load config file: OutCluster error\n", func() { client.GetClientSet(cfg) })
}
