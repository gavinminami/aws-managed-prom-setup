#!/bin/bash -e
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
aws iam detach-role-policy --role-name amp-iamproxy-ingest-role --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AMPIngestPolicy
aws iam detach-role-policy --role-name amp-iamproxy-query-role --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AMPQueryPolicy
aws iam delete-role --role-name amp-iamproxy-query-role
aws iam delete-role --role-name amp-iamproxy-ingest-role
aws iam delete-policy --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AMPQueryPolicy
aws iam delete-policy --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AMPIngestPolicy
