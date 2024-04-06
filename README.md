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

Note: update `aws-account-id` and `amp-remote-write-url` in `prometheus-values.yaml` before running `helm upgrade`

```
cd prometheus-helm
helm upgrade prometheus prometheus-community/prometheus -n default -f prometheus-values.yaml
```

## Checking that metrics are being written to AWS Managed Prometheus

You can view the `IngestionRate` and `ActiveSeries` in CloudWatch Metrics.

## Setting up VPC endpoint for AWS Managed Prometheus (optional)

This will allow communicating to AWS Managed Prometheus from the EKS cluster as if it were in the VPC. This will prevent bandwidth usage over the NAT when writing to AWS Managed Prometheus from the in-cluster Prometheus.

1. Navigate to VPC -> Endpoints in the AWS console.
2. Click `Create Endpoint` button.
3. Enter a name for the endpoint.
4. For `Service Category`, select `AWS Services`
5. For `Services`, select `com.amazonaws.<region>.aps-workspaces`
6. For `VPC`, select the VPC of your EKS cluster.
7. For `Subnets`, select each of the availability zones and select the private subnet for each of the availability zones.
8. For `Security Groups`, select or create a security group which permits HTTPS traffic.
9. For `Policy`, select `Full access`.
10. Click `Create endpoint`.

## Installing Grafana in EKS

Based on: https://docs.aws.amazon.com/prometheus/latest/userguide/AMP-onboard-query-grafana-7.3.html

### Install Grafana

```
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install grafana grafana/grafana
```

### Configure Grafana

Note: update `aws-account-id` in `grafana-values.yaml` before running `helm upgrade`

```
cd grafana
helm upgrade grafana grafana/grafana -n default -f grafana-values.yaml
```

Add Prometheus Datasource

1. Click `Add Datasource`.
2. Select `Prometheus`.
3. For `Prometheus Server URL`, use the `Endpoint - query URL` from the Managed Prometheus Workspace. Omit the `/api/v1/query` from the value.
4. For `Authentication Method`, select `SigV4 auth`.
5. For `SigV4 Auth Details` -> `Authentication Provider`, select `AWS SDK Default`.
6. For `SigV4 Auth Details` -> `Default Region`, select the region of your EKS cluster.
7. Click `Save and test` button.

## Uninstalling Grafana

```
helm uninstall grafana
```

## Uninstalling Prometheus

```
helm uninstall prometheus
```

## Removing Prometheus IAM roles

```
cd prom-iam-roles
./cleanup
```

## Notes

- If you re-create the EKS cluster, the OIDC provider will change and you will need to
  update or re-create the IRSA roles such that the trust policy references the new OIDC provider.
