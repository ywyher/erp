#!/usr/bin/env bash

# Navigate to the project directory
erp_dir=$HOME/Developments/Projects/erp/

cd "$erp_dir" || exit

# Run `pnpm run dev` and `pnpm run db:studio` in the background using Ghostty
ghostty -e "bash -c 'pnpm run dev; exec bash'" &
ghostty -e "bash -c 'pnpm run db:studio; exec bash'" &

# Wait a moment to ensure the commands are initiated
sleep 2

# Open Thunderbird
thunderbird &

# Open Firefox with specified tabs
zen &

# Open the project directory in Visual Studio Code
code "$erp_dir"

# Exit script
exit 0
