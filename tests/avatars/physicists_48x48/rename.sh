#!/bin/bash

COUNTER=1;

for i in $(ls *.png); do
  mv $i $COUNTER.png
  let COUNTER+=1
done
