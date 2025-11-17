#!/bin/bash

if [ "$CI_COMMIT_REF_NAME" == "master" ];
then
  KUBE_NAMESPACE="prod"
  echo "Deploying to production namespace"
else
  KUBE_NAMESPACE="dev"
  echo "Deploying to development namespace"
fi

export KUBE_NAMESPACE="$KUBE_NAMESPACE"

if [ ! -d /usr/local/bin/kubectl ]; then
  echo "Cant find in cache kubectl, installing kubectl"
  apk add --no-cache curl
  curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.13.0/bin/linux/amd64/kubectl
  chmod +x ./kubectl
  mv ./kubectl /usr/local/bin/kubectl
fi

echo "[*] Configuring kubectl"
kubectl config set-cluster k8s --server="${SERVER}"
kubectl config set clusters.k8s.certificate-authority-data "${CERTIFICATE_AUTHORITY_DATA}"
kubectl config set-credentials gitlab --token="${USER_TOKEN}"
kubectl config set-context default --cluster=k8s --user=gitlab
kubectl config use-context default

image_tage="488938767527.dkr.ecr.us-east-2.amazonaws.com\/veo-service:helpcenter-h5-${CI_COMMIT_SHA}"

echo "[*] Using image tag: $image_tage"
echo "[*] Deploying to namespace: ${KUBE_NAMESPACE}"

cat ci-cd/deployment.yaml | sed "s/\(image:.*\)/image: ${image_tage}/g" | sed "s/environment: .*/environment: ${KUBE_NAMESPACE}/g" | kubectl apply -n $KUBE_NAMESPACE -f -

echo "[*] Successfully deployed helpcenter-h5 to ${KUBE_NAMESPACE} namespace"