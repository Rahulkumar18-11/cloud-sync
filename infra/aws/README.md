# Public AWS deployment for CloudSync

This guide deploys the working CloudSync application behind a public HTTPS CloudFront URL. New files are stored in your existing private S3 bucket. The deployment is intentionally a compact academic/demo setup, not a high-availability production design.

## Architecture

- **Amazon CloudFront:** public HTTPS URL for the React application and `/api` routes. New share links use this public origin.
- **Amazon EC2 (t3.small default):** one Docker host running Nginx/React, FastAPI and PostgreSQL.
- **Amazon S3:** stores user file bytes in the existing private bucket `cloudsync-your-unique-suffix`.
- **EC2 IAM instance role:** gives Boto3 only `s3:PutObject`, `s3:GetObject` and `s3:DeleteObject` on that bucket. No AWS CLI credentials are stored on EC2.
- **AWS Systems Manager Session Manager:** administrative shell access without opening SSH port 22.
- **PostgreSQL:** runs on a private Docker network with a persistent Docker volume on the EC2 root EBS disk. Port 5432 is not exposed publicly.

CloudFront terminates HTTPS for visitors and forwards requests to the Nginx origin over HTTP in this demo deployment. The EC2 security group restricts port 80 to AWS's managed CloudFront origin-facing IP prefix list, and Nginx additionally checks a secret origin header. For workloads handling sensitive production data, use a custom domain and a trusted origin TLS certificate or a CloudFront VPC origin; this demo does not provide end-to-end TLS from CloudFront to EC2.

## Cost warning

Do not create the stack until you are comfortable with the charges. With the default Linux t3.small in us-east-1, the published rate is about **$0.0209/hour** (about $15.26 for 730 hours). The EC2 public IPv4 address is about **$0.005/hour** (about $3.65 for 730 hours). The 24 GiB gp3 disk is approximately **$1.92/month** at $0.08/GiB-month. That makes an always-on baseline of roughly **$20.83/month**, before CloudFront, S3 storage and requests, internet egress, snapshots, taxes, or possible T3 CPU-credit charges. Your actual amount depends on region, account offers, usage and current rates. Check the AWS pricing pages before deploying:

- [EC2 T3 instance pricing](https://aws.amazon.com/ec2/instance-types/t3/) — t3.small is 2 vCPU / 2 GiB RAM.
- [VPC public IPv4 pricing](https://aws.amazon.com/vpc/pricing/) — public IPv4 is billed by the hour.
- [EBS pricing](https://aws.amazon.com/ebs/pricing/) — gp3 capacity is billed per provisioned GiB-month.
- [CloudFront pricing and current free usage allowances](https://aws.amazon.com/cloudfront/pricing/).
- [S3 pricing](https://aws.amazon.com/s3/pricing/).
- [AWS Budgets pricing](https://aws.amazon.com/aws-cost-management/aws-budgets/pricing/) — basic budget monitoring is free.

Create a monthly AWS Budget alert (for example, $30) before deploying. An alert notifies you; it does not automatically stop resources. Keep EC2 running for the public URL to work. Stopping the instance interrupts the application. Terminating it deletes the root EBS volume and the local PostgreSQL volume unless you back them up. S3 objects remain in the separately managed bucket.

This is a single-EC2 demo deployment and has a single point of failure. For production, move PostgreSQL to RDS, move compute to private subnets behind a managed load balancer/CloudFront VPC origin, configure encrypted automated backups, monitoring, rate limits and a security review.

## Prerequisites

1. The private S3 bucket `cloudsync-your-unique-suffix` in **us-east-1**.
2. The existing `CloudSyncS3ObjectAccess` IAM policy, which you tested with the local IAM user.
3. A VPC with a public subnet in the same VPC. The subnet must have a default route to an Internet Gateway. The CloudFormation template explicitly associates a public IPv4 address with the instance.
4. The IAM deployment identity `cloudsync-local-dev` must temporarily be given the permissions in `deployment-operator-policy.json`. An AWS account administrator should create a customer-managed IAM policy named `CloudSyncDeploymentProvisioner` from that JSON and attach it to `cloudsync-local-dev`. This is a one-time infrastructure provisioning policy; it is more powerful than the application's S3 policy, so detach it when the CloudFormation stack is created.
5. After the stack is created, an administrator should create and attach `CloudSyncSessionManagerAccess` from `session-manager-access-policy.json`, then detach `CloudSyncDeploymentProvisioner`. Keep `CloudSyncS3ObjectAccess` if you still use the local CLI for S3 testing. To change or delete the stack later, temporarily reattach the deployment policy.
6. Git Bash, AWS CLI v2, and your authenticated `cloudsync` profile.

The IAM user cannot grant itself extra IAM permissions unless it already has IAM administration rights. If you do not have a separate administrator identity, use the AWS account root user only in the AWS Console for this one-time policy creation/attachment task; do not use root for CLI application access or deployment commands. Sign back in as `cloudsync-local-dev` before continuing.

## 1. Pull the deployment files and confirm AWS identity

On your Windows computer, open Git Bash:

```bash
cd ~/Desktop/cloud-sync
git switch feature/python-fastapi-migration
git pull origin feature/python-fastapi-migration
aws configure set region us-east-1 --profile cloudsync
aws sts get-caller-identity --profile cloudsync
```

Confirm the returned ARN ends with `user/cloudsync-local-dev`, not `root`.

## 2. Attach the temporary deployment policy

In the AWS Console (region does not matter for IAM):

1. Open **IAM → Policies → Create policy → JSON**.
2. Copy the complete contents of `infra/aws/deployment-operator-policy.json` from your local repository into the editor.
3. Create the policy named `CloudSyncDeploymentProvisioner`.
4. Open **IAM → Users → cloudsync-local-dev → Add permissions → Attach policies directly**.
5. Attach `CloudSyncDeploymentProvisioner`.
6. Keep `CloudSyncS3ObjectAccess` attached. Do not attach AdministratorAccess.

Sign out of the administrator/root console session and use the dedicated IAM user for the remaining commands.

Refresh the AWS CLI local-development session after policy changes:

```bash
aws login --profile cloudsync --region us-east-1
```

Complete the browser sign-in as `cloudsync-local-dev`. If the CLI asks to overwrite an existing profile session for the IAM user, confirm.

## 3. Find the CloudFront origin prefix list and a public subnet

The CloudFormation template limits inbound EC2 port 80 to the AWS-managed CloudFront origin-facing prefix list. Retrieve its **us-east-1 ID**:

```bash
aws ec2 describe-managed-prefix-lists \
  --filters Name=prefix-list-name,Values=com.amazonaws.global.cloudfront.origin-facing \
  --query 'PrefixLists[0].PrefixListId' \
  --output text \
  --profile cloudsync \
  --region us-east-1
```

Copy the result (it starts with `pl-`). Enter it as the `CloudFrontOriginFacingPrefixListId` CloudFormation parameter. This prefix list is maintained by AWS; do not hardcode a CIDR list. AWS documents the list as `com.amazonaws.global.cloudfront.origin-facing` and notes its security-group rule weight is 55. Do not add unnecessary ingress rules to that security group.

Find the default VPC and its subnets:

```bash
VPC_ID=$(aws ec2 describe-vpcs \
  --filters Name=isDefault,Values=true \
  --query 'Vpcs[0].VpcId' --output text \
  --profile cloudsync --region us-east-1)

echo "$VPC_ID"

aws ec2 describe-subnets \
  --filters Name=vpc-id,Values="$VPC_ID" \
  --query 'Subnets[*].[SubnetId,AvailabilityZone,MapPublicIpOnLaunch]' \
  --output table \
  --profile cloudsync --region us-east-1
```

Select a subnet in that VPC that has a route to an Internet Gateway. If no default VPC exists, an administrator must create/select a VPC and public subnet first. The CloudFormation template does not create a VPC or NAT Gateway.

## 4. Generate the origin token

Generate a random 48-character token on your computer:

```bash
openssl rand -hex 24
```

Keep it in a password manager or secure local note. You will enter this exact value as the CloudFormation `OriginToken` parameter and later in the server-only `.env` file. Do not paste it into GitHub, source files or chat.

## 5. Create the CloudFormation stack

1. Open the [CloudFormation console](https://console.aws.amazon.com/cloudformation/home?region=us-east-1) in **US East (N. Virginia), us-east-1**.
2. Choose **Create stack → With new resources (standard)**.
3. Choose **Upload a template file** and select `infra/aws/cloudformation-ec2-cloudfront.yaml` from your local clone.
4. Stack name: `cloudsync-demo`.
5. Set parameters:
   - `VpcId`: the VPC ID from Step 3.
   - `PublicSubnetId`: the public subnet selected from that VPC.
   - `S3BucketName`: `cloudsync-your-unique-suffix`.
   - `CloudFrontOriginFacingPrefixListId`: the `pl-...` value from Step 3.
   - `InstanceType`: `t3.small` (2 GiB RAM) for the low-cost demo; `t3.medium` has 4 GiB and costs more.
   - `OriginToken`: the 48-character value from Step 4.
   - `GitRepositoryUrl`: leave the repository default.
   - `GitBranch`: `feature/python-fastapi-migration`.
6. Keep the remaining options at their defaults. Acknowledge `CAPABILITY_NAMED_IAM` when prompted.
7. Create the stack and wait for `CREATE_COMPLETE`. CloudFront distribution deployment can take longer than the EC2 launch.

The template creates an EC2 instance, security group, EC2 IAM role/instance profile, and CloudFront distribution. The instance role grants only object access to the specified S3 bucket and the AWS-managed SSM core policy. No AWS access keys are requested or put in EC2 user data.

If stack creation fails, open the CloudFormation **Events** tab and read the first `CREATE_FAILED` event. Do not repeatedly retry without correcting the reported cause.

## 6. Connect to EC2 using Systems Manager

1. Open EC2 → Instances and find the instance ID in CloudFormation Outputs.
2. Choose **Connect → Session Manager → Connect**.
3. In the shell, run:

```bash
sudo -i
cd /opt/cloudsync
docker --version
docker compose version
```

If the repository directory or Docker Compose is missing, inspect:

```bash
tail -100 /var/log/cloud-init-output.log
```

Do not proceed until the repository, Docker and Compose are present.

## 7. Create the server-only environment file

Generate two more secrets locally:

```bash
openssl rand -hex 24
openssl rand -hex 32
```

Use one for `POSTGRES_PASSWORD` and one for `JWT_SECRET_KEY`. Keep them private.

In the EC2 Session Manager shell, create `/opt/cloudsync/.env`:

```bash
cd /opt/cloudsync
umask 077
cat > .env <<'EOF'
POSTGRES_PASSWORD=PASTE_FIRST_RANDOM_VALUE
JWT_SECRET_KEY=PASTE_SECOND_RANDOM_VALUE
AWS_REGION=us-east-1
AWS_S3_BUCKET=cloudsync-your-unique-suffix
ORIGIN_TOKEN=PASTE_THE_SAME_ORIGIN_TOKEN_USED_IN_CLOUDFORMATION
EOF
chmod 600 .env
```

Replace the three placeholder values before saving. Never paste this file's contents into chat or commit it. The EC2 instance role supplies Boto3 credentials automatically; do not set `AWS_PROFILE` or add access keys on EC2.

## 8. Build and start CloudSync

The t3.small has 2 GiB RAM. Add a temporary 2 GiB swap file before building to reduce the risk of the frontend build running out of memory:

```bash
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
fi
free -h
```

Build one image at a time, then start the services:

```bash
cd /opt/cloudsync
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml build web
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100
```

The compose stack publishes only port 80 on EC2 and keeps PostgreSQL internal to Docker. CloudFront is the public HTTPS entry point. Nginx serves the React SPA and proxies `/api/` to FastAPI. Requests to the EC2 origin must come from the CloudFront origin-facing prefix list and include the CloudFront custom origin token.

## 9. Get the public URL and test end-to-end

In CloudFormation → your stack → **Outputs**, copy `PublicApplicationUrl`. It should resemble:

```text
https://dxxxxxxxxxxxxx.cloudfront.net
```

Open it and test:

1. Register and log in.
2. Upload a new file. Confirm its API metadata shows `storage_backend: "s3"`.
3. Download the file.
4. Create a share link. It should use the CloudFront HTTPS hostname, not localhost.
5. Open the link on a phone or in an incognito browser on another device.
6. Delete a test file and confirm the object is deleted from S3.

Old localhost links remain localhost links. Create new links from the deployed public application.

## 10. Remove temporary provisioning permissions

After CloudFormation reaches `CREATE_COMPLETE`:

1. In IAM, create a customer-managed policy named `CloudSyncSessionManagerAccess` from `infra/aws/session-manager-access-policy.json`.
2. Attach it to `cloudsync-local-dev`.
3. Detach `CloudSyncDeploymentProvisioner` from `cloudsync-local-dev`.
4. Keep `CloudSyncS3ObjectAccess` if you still use the local AWS CLI for S3 operations.

The EC2 instance uses its own role and does not depend on your local IAM user's policies. Do not remove the EC2 instance role or the SSM managed policy from that role.

## Updating the deployed application

Use Session Manager to connect. Then:

```bash
cd /opt/cloudsync
git fetch origin
git checkout feature/python-fastapi-migration
git pull --ff-only origin feature/python-fastapi-migration
docker compose -f docker-compose.prod.yml up -d --build
```

If a version changes the database schema, back up PostgreSQL and review the migration before applying it.

## Back up PostgreSQL

From the EC2 shell:

```bash
cd /opt/cloudsync
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres -d cloudsync > cloudsync-backup.sql
```

Copy the backup to a protected off-instance location before replacing the instance or deleting the stack. Do not treat the local Docker volume as a backup.

## Stop or delete the deployment

To stop containers while keeping EC2 and its data volume:

```bash
cd /opt/cloudsync
docker compose -f docker-compose.prod.yml down
```

The public application stops working while EC2/containers are stopped.

Before deleting the CloudFormation stack, create and verify an off-instance PostgreSQL backup. Deleting the stack terminates EC2 and deletes its root EBS volume, including the PostgreSQL Docker volume. The separately created S3 bucket and S3 objects are not deleted by this stack. To avoid ongoing charges, delete the stack when you no longer need the public demo.

## Security boundaries and limits

- S3 remains private with Block Public Access enabled.
- EC2 uses an IAM instance role with only the required object operations on the selected bucket plus SSM core access.
- The EC2 security group accepts port 80 only from the AWS-managed CloudFront origin-facing prefix list; Nginx also checks the custom CloudFront origin header.
- No inbound SSH or public PostgreSQL port is opened.
- Visitor-to-CloudFront traffic is HTTPS. This demo uses HTTP between CloudFront and EC2; use a custom domain with trusted origin TLS or a CloudFront VPC origin for end-to-end encrypted origin transport.
- One EC2 host is a single point of failure. This architecture is for a low-traffic academic/demo deployment, not a production SLA.
