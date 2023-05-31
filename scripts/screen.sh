#!/usr/bin/env bash

XAUTHORITY=/home/[username]/.Xauthority

if [[ "$1" == "on" ]]
then
  /usr/bin/xset -display :0 dpms force on
  /usr/bin/xset -display :0 s noblank
  /usr/bin/xset -display :0 s off
elif [[ "$1" == "off" ]]
then
  /usr/bin/xset -display :0 dpms force off
fi