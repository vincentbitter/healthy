#!/bin/bash
set -e

PERSIST_GIT="/workspaces/.codespaces/shared/git/.gitconfig"

if [ -f "$PERSIST_GIT" ] && [ ! -L ~/.gitconfig ]; then
    ln -s "$PERSIST_GIT" ~/.gitconfig
fi