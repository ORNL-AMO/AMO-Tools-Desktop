#!/bin/bash
find . -name "package-lock.json" -not -path "*/node_modules/*" -not -path "*/dist/*" -exec dirname {} \; | sort -u | while read dir; do
  echo "Installing dependencies for: $dir"
  (cd "$dir" && npm install)
done