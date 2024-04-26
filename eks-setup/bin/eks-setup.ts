#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import * as blueprints from "@aws-quickstart/eks-blueprints";
import { InstanceType } from "aws-cdk-lib/aws-ec2";
import { KubernetesVersion, MachineImageType } from "aws-cdk-lib/aws-eks";

const app = new cdk.App();
const account =
  process.env.CDK_DEFAULT_ACCOUNT || process.env.CDK_DEPLOY_ACCOUNT || "";
const region = "us-west-2";
const version = "auto";

blueprints.HelmAddOn.validateHelmVersions = true; // optional if you would like to check for newer versions

const addOns: Array<blueprints.ClusterAddOn> = [
  new blueprints.addons.VpcCniAddOn(),
  new blueprints.addons.EbsCsiDriverAddOn({
    version: "auto",
    storageClass: "gp3",
  }),
];

console.log(
  `Creating EKS Blueprint in account ${account} and region ${region}`
);

const props: blueprints.AsgClusterProviderProps = {
  id: "eks-blueprint",
  minSize: 1,
  maxSize: 3,
  desiredSize: 3, // at least 3 nodes are required for Loki's statefulset
  version: KubernetesVersion.V1_29,
  instanceType: new InstanceType("m5.large"),
  machineImageType: MachineImageType.AMAZON_LINUX_2,
};
const clusterProvider = new blueprints.AsgClusterProvider(props);

const stack = blueprints.EksBlueprint.builder()
  .account(account)
  .region(region)
  .version(version)
  .addOns(...addOns)
  .useDefaultSecretEncryption(false) // set to false to turn secret encryption off (non-production/demo cases)
  .clusterProvider(clusterProvider)
  .build(app, "eks-blueprint");
