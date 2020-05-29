#!/bin/bash

# Bail on unset variables, errors and trace execution
set -eux

# Set up Docker image
#####################

cat <<EOF > .dockerignore
node_modules
.serverless
EOF

cat <<EOF > Dockerfile
FROM node:12.16.3
COPY . /build
WORKDIR /build
RUN npm install && npm install -g serverless@1.55.1
EOF

dockerTag=edsc-$bamboo_STAGE_NAME
docker build -t $dockerTag .

# Convenience function to invoke `docker run` with appropriate env vars instead of baking them into image
dockerRun() {
    docker run \
        -e "AWS_ACCESS_KEY_ID=$bamboo_AWS_ACCESS_KEY_ID" \
        -e "AWS_SECRET_ACCESS_KEY=$bamboo_AWS_SECRET_ACCESS_KEY" \
        -e "CMR_ROOT_URL=$bamboo_CMR_ROOT_URL" \
        -e "LAMBDA_TIMEOUT=$bamboo_LAMBDA_TIMEOUT" \
        -e "LOG_DESTINATION_ARN=$bamboo_LOG_DESTINATION_ARN" \
        -e "NODE_ENV=production" \
        -e "SUBNET_ID_A=$bamboo_SUBNET_ID_A" \
        -e "SUBNET_ID_B=$bamboo_SUBNET_ID_B" \
        -e "VPC_ID=$bamboo_VPC_ID" \
        $dockerTag "$@"
}

# Execute serverless commands in Docker
#######################################

stageOpts="--stage $bamboo_STAGE_NAME"

# Deploy AWS Infrastructure Resources
echo 'Deploying AWS Infrastructure Resources...'
dockerRun serverless deploy $stageOpts --config serverless-infrastructure.yml

# Deploy AWS Application Resources
echo 'Deploying AWS Application Resources...'
dockerRun serverless deploy $stageOpts