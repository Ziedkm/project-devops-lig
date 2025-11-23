#!/bin/bash
if curl -s --head  --request GET http://localhost:8081 | grep "200" > /dev/null; then 
   echo "Test Passed"
   exit 0
else
   echo "Test Failed"
   exit 1
fi
