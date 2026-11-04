# Deploy CloudSync to AWS (simple one-server setup)

This is the simplest deployment for the current project: **one EC2 instance runs the React frontend, FastAPI backend and PostgreSQL with Docker Compose.** The existing private S3 bucket stores uploaded file contents.

Once deployed, open the public IP shown by CloudFormation, for example:

```text
http://54.12.34.56
```

Because the React app is served from that public address, share links automatically use the same address:

```text
http://54.12.34.56/shared/<token>
```

No CloudFront, load balancer, RDS, domain name or separate frontend hosting is required for this demo.

## What runs in AWS

- EC2: runs Docker Compose.
- Nginx: serves React and forwards `/api/` requests to FastAPI.
- FastAPI: handles login, file metadata, upload/download/delete and share links.
- PostgreSQL: stores users, file metadata and share tokens in a persistent Docker volume.
- Your existing private S3 bucket: stores actual uploaded file contents.
- EC2 instance role: lets Boto3 access only objects in the CloudSync bucket. Do not copy local AWS credentials to EC2.
- Elastic IP: gives the server a stable public IP, so old share links do not change after an EC2 stop/start.

## Important security and cost notes

This first simple deployment uses **HTTP**, not HTTPS. It is suitable for a class/demo with test data, but do not upload confidential files or reuse passwords while it is HTTP: browser traffic, including login requests, is not encrypted. Add a domain and HTTPS before using it for real personal or sensitive files.

A t3.small in us-east-1 is approximately $15.18/month at the listed On-Demand rate, and the public IPv4/Elastic IP is $0.005/hour (about $3.65 per 730-hour month). Add the 24 GiB EBS disk, S3, data transfer and tax. Check AWS prices and your account's free-tier/credit eligibility before creating the stack. AWS charges for public IPv4 addresses whether in use or idle. Sources: [EC2 T3 pricing](https://aws.amazon.com/ec2/instance-types/t3/) and [VPC public IPv4 pricing](https://aws.amazon.com/vpc/pricing/).

The instance must stay running for share links to work. Stop/delete it when you are done if you do not need the public site. Do not delete the CloudFormation stack until you have backed up the PostgreSQL database: user accounts, file metadata and share tokens are stored on the EC2 disk. S3 file objects are in your separate bucket and are not deleted by this stack.

## 1. Pull the deployment files

On your Windows computer, open Git Bash:

```bash
cd ~/Desktop/cloud-sync
git switch feature/python-fastapi-migration
git pull origin feature/python-fastapi-migration
```

## 2. Give your IAM user temporary deployment permission

Your `cloudsync-local-dev` user already has the S3 object policy. It also needs temporary permission to create the EC2 server and its limited instance role.

In the AWS Console, using an administrator account for this one-time IAM change:

1. Open **IAM → Policies → Create policy → JSON**.
2. Paste the contents of `infra/aws/deployment-operator-policy.json`.
3. Name the policy `CloudSyncDeploymentProvisioner`.
4. Open **IAM → Users → cloudsync-local-dev → Add permissions → Attach policies directly**.
5. Attach `CloudSyncDeploymentProvisioner`. Keep `CloudSyncS3ObjectAccess` attached.

Sign back into AWS as `cloudsync-local-dev`. Do not use root credentials in Git Bash.

Refresh the local CLI session:

```bash
aws login --profile cloudsync --region us-east-1
aws configure set region us-east-1 --profile cloudsync
aws sts get-caller-identity --profile cloudsync
```

Confirm the ARN ends in `user/cloudsync-local-dev`.

## 3. Create an EC2 SSH key pair

This key lets you connect to the server. The private key is downloaded only once; keep it safe and never upload it to GitHub.

```bash
mkdir -p ~/.ssh
aws ec2 create-key-pair \
  --key-name cloudsync-key \
  --key-type rsa \
  --query KeyMaterial \
  --output text \
  --profile cloudsync \
  --region us-east-1 > ~/.ssh/cloudsync-key.pem
chmod 400 ~/.ssh/cloudsync-key.pem
```

If `cloudsync-key` already exists in EC2, do not run create-key-pair again; use the original private key file. AWS cannot re-download the private key.

## 4. Find your VPC, public subnet and current public IP

Get the default VPC:

```bash
VPC_ID=$(aws ec2 describe-vpcs \
  --filters Name=isDefault,Values=true \
  --query 'Vpcs[0].VpcId' --output text \
  --profile cloudsync --region us-east-1)
echo "$VPC_ID"
```

List its subnets:

```bash
aws ec2 describe-subnets \
  --filters Name=vpc-id,Values="$VPC_ID" \
  --query 'Subnets[*].[SubnetId,AvailabilityZone,MapPublicIpOnLaunch]' \
  --output table \
  --profile cloudsync --region us-east-1
```

Choose a subnet in the default VPC with a route to an Internet Gateway (in the AWS Console, check **VPC → Subnets → Route table**; it must have `0.0.0.0/0` pointing to an Internet Gateway).

Get your current public IP for SSH restriction:

```bash
curl -s https://checkip.amazonaws.com
```

Write it down as `YOUR_PUBLIC_IP/32`, for example `203.0.113.10/32`. Use your actual IP, not the example. If your ISP changes your IP, update the EC2 security group SSH rule.

## 5. Create the CloudFormation stack

1. Open the [CloudFormation Console in us-east-1](https://console.aws.amazon.com/cloudformation/home?region=us-east-1).
2. Choose **Create stack → With new resources (standard)**.
3. Select **Upload a template file** and upload `infra/aws/cloudformation-ec2-public-ip.yaml` from your local repository.
4. Stack name: `cloudsync-demo`.
5. Set the parameters:
   - `VpcId`: the default VPC ID from Step 4.
   - `PublicSubnetId`: the public subnet selected from Step 4.
   - `KeyPairName`: `cloudsync-key`.
   - `SshAllowedCidr`: your public IP followed by `/32`.
   - `S3BucketName`: `cloudsync-your-unique-suffix`.
   - `InstanceType`: keep `t3.small` for the demo (2 GiB RAM).
   - Keep the Git repository and branch defaults.
6. Acknowledge `CAPABILITY_NAMED_IAM` when asked.
7. Create the stack and wait until its status is `CREATE_COMPLETE`.

The stack creates one EC2 instance, a security group, a restricted EC2 IAM role/instance profile and an Elastic IP. It does not create another S3 bucket.

If the stack fails, open the **Events** tab and inspect the first `CREATE_FAILED` event. Correct that issue before retrying.

## 6. Connect to the EC2 instance

In CloudFormation → `cloudsync-demo` → **Outputs**, copy `PublicIPv4`.

From Git Bash:

```bash
ssh -i ~/.ssh/cloudsync-key.pem ec2-user@YOUR_PUBLIC_IP
```

Replace `YOUR_PUBLIC_IP` with the output value. If SSH asks to trust the host, type `yes`.

Switch to root and check the installed software:

```bash
sudo -i
cd /opt/cloudsync
docker --version
docker compose version
```

If `/opt/cloudsync` is not ready yet, wait a minute and check the EC2 user-data log:

```bash
tail -100 /var/log/cloud-init-output.log
```

## 7. Create the production environment file

On the EC2 server, generate the database and JWT secrets and write the server-only environment file:

```bash
cd /opt/cloudsync
POSTGRES_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET_KEY=$(openssl rand -hex 32)
umask 077
cat > .env <<EOF
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
JWT_SECRET_KEY=$JWT_SECRET_KEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=cloudsync-your-unique-suffix
EOF
chmod 600 .env
```

Keep this file on the server only. Do not paste its values into chat or commit it. The EC2 IAM role provides AWS credentials to Boto3 automatically; do not set `AWS_PROFILE` or create AWS access keys on the server.

## 8. Start CloudSync

Build the two application images and start all services:

```bash
cd /opt/cloudsync
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml build web
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

Check logs if a service is not healthy:

```bash
docker compose -f docker-compose.prod.yml logs --tail=100
```

The EC2 instance was configured with a 2 GiB swap file to make the frontend build more reliable on a t3.small.

## 9. Open the public application

In CloudFormation → stack Outputs, copy `PublicApplicationUrl`. It should look like:

```text
http://YOUR_ELASTIC_IP
```

Open it in Chrome. Register/login, upload a **new** test file, download it, create a share link and open that link in an incognito window or on another device. New uploads should show **Amazon S3** in the dashboard.

The generated link will use the same public IP, for example:

```text
http://YOUR_ELASTIC_IP/shared/<token>
```

Old localhost links remain localhost links. Create new share links from the deployed site.

## 10. Remove temporary deployment permission

After the stack reaches `CREATE_COMPLETE`, remove `CloudSyncDeploymentProvisioner` from `cloudsync-local-dev`. Keep `CloudSyncS3ObjectAccess` for your local CLI S3 testing. The EC2 instance uses its separate instance role and is not affected when you remove the deployment policy from your IAM user.

## Update the deployed application

Connect to EC2, then:

```bash
cd /opt/cloudsync
git fetch origin
git checkout feature/python-fastapi-migration
git pull --ff-only origin feature/python-fastapi-migration
docker compose -f docker-compose.prod.yml up -d --build
```

## Back up PostgreSQL before deleting the server

```bash
cd /opt/cloudsync
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres -d cloudsync > cloudsync-backup.sql
```

Copy the backup off the instance. Deleting the CloudFormation stack deletes the EC2 root disk and its PostgreSQL volume. The separately created S3 bucket and objects are not deleted by the stack.

## Stop the application

To stop containers but retain the EC2 instance and its database volume:

```bash
cd /opt/cloudsync
docker compose -f docker-compose.prod.yml down
```

The public site and share links will not work until the containers are started again.
