#!/bin/bash

# Vercel Ignored Build Step
# This script determines if a build should be skipped based on changed files
# Exit code 0 = Skip build, Exit code 1 = Proceed with build

echo "🔍 Checking if build should be ignored..."

# Get the list of changed files in the last commit
CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD)

echo "📝 Changed files:"
echo "$CHANGED_FILES"

# Check if any non-content files were changed
NON_CONTENT_CHANGES=0

while IFS= read -r file; do
  # Skip empty lines
  [ -z "$file" ] && continue
  
  # Check if the file is NOT in content-data/ or public/images/
  if [[ ! "$file" =~ ^content-data/ ]] && [[ ! "$file" =~ ^public/images/ ]]; then
    echo "🔧 Non-content file changed: $file"
    NON_CONTENT_CHANGES=1
    break
  else
    echo "📄 Content file changed: $file"
  fi
done <<< "$CHANGED_FILES"

# If no non-content files changed, skip the build
if [ $NON_CONTENT_CHANGES -eq 0 ]; then
  echo "⏭️  Only content files changed. Skipping build to save resources."
  exit 0
else
  echo "🚀 Code files changed. Proceeding with build."
  exit 1
fi