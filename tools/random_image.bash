#!/usr/bin/env bash

if [[ "$1" == "--help" ]]
then
    declare -r script_name="`basename $0`"
    echo "Usage:"
    echo "  $script_name --help"
    echo "  $script_name <image> [<image>...]"
    echo
    echo "Options:"
    echo "  --help  - show help."
    echo
    echo "Arguments:"
    echo "  <image>  - path to an image."

    exit 0
fi

declare -ra images=("$@")
declare -ri images_number=${#images[@]}
declare -ri random_index=$((RANDOM % images_number))
declare -r random_image="${images[$random_index]}"

declare -r inbox_message="`jq -r ".text"`"
echo "$inbox_message \${file://$random_image}"
