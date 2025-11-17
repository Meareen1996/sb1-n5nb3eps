#!/bin/bash

set -e
docker -v

# test if directory is empty
if [ ! -d "./dist" ] || [ -z "$(ls ./dist)" ] ; then
  echo "Empty dist, exit"
  exit 1
fi

# login to ecr
echo "[*] Login to ECR"
token=$(aws ecr get-login-password --region us-east-2)
result=$(docker login --username AWS -p $token 488938767527.dkr.ecr.us-east-2.amazonaws.com)
if [ "$result" != "Login Succeeded" ] ; then
  echo "Login to ECR Failed. Please contact li.zhou@veoride.com for further instructions."
  exit 1
fi
echo "[*] Login process done"

# Build and push Docker image
echo "[*] Building Docker image for helpcenter-h5-${CI_COMMIT_SHA}"
docker build -t "488938767527.dkr.ecr.us-east-2.amazonaws.com/veo-service:helpcenter-h5-${CI_COMMIT_SHA}" .
echo "[*] Pushing Docker image to ECR"
docker push "488938767527.dkr.ecr.us-east-2.amazonaws.com/veo-service:helpcenter-h5-${CI_COMMIT_SHA}"
echo "[*] Docker image pushed successfully"