#!/bin/bash
set -e

# Sync changes to master node
sshpass -p 'default' rsync -av --exclude 'node_modules' --exclude 'target' --exclude '.git' ./backend/ student1@10.6.101.163:/home/student1/e-converse-deploy/backend/

# Run build and deployment commands on master node
sshpass -p 'default' ssh -o StrictHostKeyChecking=no student1@10.6.101.163 << 'EOF'
set -e
cd e-converse-deploy

# Build new image
sudo docker build -t e-converse-backend:latest ./backend

# Save image
sudo docker save e-converse-backend:latest -o backend.tar
sudo chown student1:student1 backend.tar

# Import in local K3s (master)
sudo k3s ctr images import backend.tar

# Copy to workers and import
sshpass -p 'default' scp -o StrictHostKeyChecking=no backend.tar student1@10.6.101.162:/home/student1/
sshpass -p 'default' scp -o StrictHostKeyChecking=no backend.tar student1@10.6.101.168:/home/student1/

sshpass -p 'default' ssh -o StrictHostKeyChecking=no student1@10.6.101.162 "sudo k3s ctr images import /home/student1/backend.tar"
sshpass -p 'default' ssh -o StrictHostKeyChecking=no student1@10.6.101.168 "sudo k3s ctr images import /home/student1/backend.tar"

# Restart deployment
sudo k3s kubectl rollout restart deployment backend
EOF
