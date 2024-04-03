# aws-managed-prom-setup

Tutorial to setup AWS Managed Prometheus with EKS

## References

## Creating a AWS Managed Prometheus Workspace

1. Navigate to https://us-west-2.console.aws.amazon.com/prometheus/home?region=us-west-2#/workspaces/create
2. Enter a workspace alias.
3. Click the `Create workspace` button.
4. Note the `Endpoint - remote write URL`

## Creating an EKS Cluster (if you don't already have one)

Based on: https://aws-quickstart.github.io/cdk-eks-blueprints/getting-started/

1. `cd eks-setup`
2. `npm install`
3. `npx cdk diff eks-blueprint`
4. `npx cdk deploy eks-blueprint`
5. Create kubeconfig to connect to cluster using command provided at end of cdk deployment.

## Install Prometheus in the EKS cluster

```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/prometheus
```

## Viewing Prometheus Query Interface

1. Setup K8s port forwarding:

```
kubectl port-forward <prometheus-server-pod-id> 9090:9090
```

2. (Optional if running kubectl from EC2 instance) Setup port forwarding from laptop to EC2 instance

3. Open browser to http://localhost:9090

## Create IAM role to allow in-cluster Prometheus to write to AWS managed Prometheus

Based on: https://docs.aws.amazon.com/prometheus/latest/userguide/set-up-irsa.html#set-up-irsa-ingest

1. Update `CLUSTER_NAME` and `SERVICE_ACCOUNT_NAMESPACE` in `prom-iam-roles/sh`
2. Run the following:

```
cd prom-iam-roles
./createIRSA-AMPIngest.sh
./createIRSA-AMPQuery.sh
```

## Setup remote write to AWS managed Prometheus

Based on instructions from AWS Console -> AWS Managed Prometheus

```
helm upgrade prometheus prometheus-community/prometheus -n default -f prometheus-values.yaml
```
