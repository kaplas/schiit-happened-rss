#!/bin/sh
set -e  # stop on errors

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
BUILD_DIR="$CURRENT_DIR/build"

rm -rf "$BUILD_DIR"
mkdir "$BUILD_DIR"

node generate.js
ls -l "$BUILD_DIR"