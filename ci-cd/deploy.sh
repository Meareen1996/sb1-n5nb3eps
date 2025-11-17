#!/bin/bash

# test if directory is empty
if [ ! -d "./dist" ] || [ -z "$(ls ./dist)" ] ; then
  echo "Empty dist, exit"
  exit 1
fi

apk update && apk add bash && apk add git
set -e

KUBE_NAMESPACE="deployed"

if [ "$CI_COMMIT_REF_NAME" == "master" ];
then
  TARGET_CLUSTER="fargate"
  DEPLOYMENT_FILE="ci-cd/deployment.yaml"
  echo "Deploying to production cluster: fargate"
elif [ "$CI_COMMIT_REF_NAME" == "develop" ];
then
  TARGET_CLUSTER="fargate-dev"
  DEPLOYMENT_FILE="ci-cd/deployment-dev.yaml"
  echo "Deploying to development cluster: fargate-dev"
else
  echo "Unknown branch: $CI_COMMIT_REF_NAME"
  exit 1
fi

export KUBE_NAMESPACE="$KUBE_NAMESPACE"

if [ ! -d /usr/local/bin/kubectl ]; then
  echo "Cant find in cache kubectl, installing kubectl"
  apk add --no-cache curl
  curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.13.0/bin/linux/amd64/kubectl
  chmod +x ./kubectl
  mv ./kubectl /usr/local/bin/kubectl
fi

# Understand who we are right now on AWS
echo "[*] Getting AWS caller identity"
aws sts get-caller-identity

# Context Switch to target EKS cluster
echo "[*] Updating kubeconfig for cluster: $TARGET_CLUSTER"
aws eks update-kubeconfig --region us-east-2 --name $TARGET_CLUSTER

image_tage="488938767527.dkr.ecr.us-east-2.amazonaws.com\/veo-service:helpcenter-h5-${CI_COMMIT_SHA}"

echo "[*] Using image tag: $image_tage"
echo "[*] Using deployment file: $DEPLOYMENT_FILE"
echo "[*] Deploying to namespace: ${KUBE_NAMESPACE}"

cat $DEPLOYMENT_FILE | sed "s/\(image:.*\)/image: ${image_tage}/g" | kubectl apply -n $KUBE_NAMESPACE -f -

echo "[*] Successfully deployed helpcenter-h5 to ${TARGET_CLUSTER}"