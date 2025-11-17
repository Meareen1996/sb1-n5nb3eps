#!/bin/bash
set -e
set -x

npm ci --no-audit --no-fund

# Build for different environments
if [ "$CI_COMMIT_REF_NAME" == "master" ]; then
    echo "Building for production environment"
    export VITE_ENV=production
else
    echo "Building for development environment"
    export VITE_ENV=development
fi

npm run build
ls -lh dist

echo "Build completed successfully"
