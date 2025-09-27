#!/bin/bash
if git diff --name-only HEAD~1 HEAD | grep -v '^content-data/\|^public/images/' > /dev/null; then echo "Code changed. Building."; exit 0; else echo "Only content changed. Skipping."; exit 1; fi

