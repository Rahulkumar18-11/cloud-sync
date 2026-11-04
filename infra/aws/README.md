# AWS deployment for CloudSync

This is a small academic/demo deployment, not a high-availability production design.

## Architecture

- **Amazon EC2 (t3.small by default):** runs Docker Compose, FastAPI, Nginx/React and PostgreSQL.
- **Amazon S3:** stores user file bytes in the existing private CloudSync bucket.
- **EC2 instance role:** grants the backend only s3:PutObject, s3:GetObject and s3:DeleteObject on that bucket. Boto3 uses the instance role; do not install or copy AWS access keys onto the server.
- **AWS Systems Manager Session Manager:** provides shell access without opening SSH port 22.
- **Amazon CloudFront:** provides the public HTTPS hostname. It forwards requests to the EC2 Nginx origin, which serves the React SPA and proxies /api/ to FastAPI. The CloudFront distribution adds an origin-only token header; Nginx rejects direct origin requests without it.
- **PostgreSQL:** runs in a private Docker network and uses a persistent Docker volume on the EC2 root EBS disk. Port 5432 is not exposed to the internet.

The React frontend uses a relative /api/v1 API base URL and builds share links from the browser's public origin. A generated link will therefore use the CloudFront HTTPS domain rather than localhost.

## Cost and operational note

The CloudFormation default is a Linux t3.small in the selected Region. AWS publishes a US East (N. Virginia) On-Demand rate of about $0.0209/hour for t3.small; an in-use public IPv4 address is $0.005/hour. A 24 GiB gp3 boot disk, CloudFront requests/transfer, S3 storage/requests, outbound data transfer, snapshots, and any CPU-credit overage can add charges. A rough always-on compute + public IPv4 baseline is about $18.90/month before storage, CloudFront, S3 and data transfer (prices and free-tier eligibility vary). See current [EC2 T3 pricing](https://aws.amazon.com/ec2/instance-types/t3/), [VPC public IPv4 pricing](https://aws.amazon.com/vpc/pricing/), [EBS pricing](https://aws.amazon.com/ebs/pricing/), [CloudFront pricing](https://aws.amazon.com/cloudfront/pricing/) and [S3 pricing](https://aws.amazon.com/s3/pricing/).

Set an AWS Budget alert before deploying. The EC2 instance must remain running for share links to work. Stopping it interrupts the app; terminating it deletes the PostgreSQL Docker volume on its root disk. Files in S3 remain, but database metadata, user accounts and share tokens can be lost if the server disk is deleted. Back up PostgreSQL before updates and before deleting the CloudFormation stack.

This is a compact demo deployment: one EC2 host is a single point of failure. For production, move PostgreSQL to RDS, place compute in private subnets behind a managed load balancer or CloudFront VPC origin, add backups/monitoring/rate limits, and review security and privacy controls.

## Prerequisites

1. The existing private S3 bucket, cloudsync-your-unique-suffix, in us-east-1.
2. The S3 object IAM policy already tested with the local IAM user.
3. A VPC and a public subnet in the same VPC. The subnet must have a route to an Internet Gateway and auto-assign public IPv4 enabled.
4. Your IAM deployment identity must be permitted to create CloudFormation stacks, EC2 security groups/instances, IAM roles and instance profiles, pass the EC2 role to EC2, and create CloudFront distributions. The stack creates a named IAM role, so CloudFormation requires CAPABILITY_NAMED_IAM.
5. AWS Systems Manager Session Manager access for your IAM identity. Do not open port 22 or use root credentials for the application.

## 1. Create the stack

1. Open the CloudFormation console in US East (N. Virginia), us-east-1 (the same Region as the existing bucket).
2. Choose Create stack → With new resources (standard).
3. Upload infra/aws/cloudformation-ec2-cloudfront.yaml from this repository.
4. Choose a stack name such as cloudsync-demo.
5. Select the VPC and a public subnet in that same VPC.
6. Keep the S3 bucket parameter as cloudsync-your-unique-suffix.
7. Keep instance type t3.small for the starting configuration.
8. Generate a random 48-character alphanumeric value for OriginToken. Save it in a password manager; it is used by CloudFront to authenticate to Nginx.
9. Keep the repository URL and migration branch defaults unless you intentionally deploy a different branch.
10. Acknowledge CAPABILITY_NAMED_IAM when prompted and create the stack.
11. Wait until the stack reaches CREATE_COMPLETE. The EC2 user data installs Docker/Compose and clones the selected branch. CloudFront can take additional time to finish deploying.

The template does not ask for AWS access keys and does not place database/JWT secrets in EC2 user data.

## 2. Connect to EC2 using Systems Manager

1. Open EC2 → Instances and find the instance ID from the CloudFormation outputs.
2. Choose Connect → Session Manager → Connect.
3. In the session, run:

    sudo -i
    cd /opt/cloudsync
    docker --version
    docker compose version

If the repository directory is missing, inspect cloud-init output:

    sudo tail -100 /var/log/cloud-init-output.log

Do not proceed until Docker, Compose and the repository are present.

## 3. Create the server-only environment file

Generate three strong secrets on your own computer. For example, in Git Bash:

    openssl rand -hex 24
    openssl rand -hex 32
    openssl rand -hex 24

Use the first output for POSTGRES_PASSWORD, the second for JWT_SECRET_KEY, and the third for ORIGIN_TOKEN. Keep all values private. The ORIGIN_TOKEN must exactly match the value supplied to CloudFormation.

In the EC2 Session Manager shell, create /opt/cloudsync/.env:

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

Replace the four placeholder values before saving. Do not commit this file or paste its contents into chat. The EC2 instance role supplies AWS credentials automatically; do not set AWS_PROFILE or add AWS access keys on the server.

## 4. Start the application

From /opt/cloudsync:

    docker compose -f docker-compose.prod.yml up -d --build
    docker compose -f docker-compose.prod.yml ps
    docker compose -f docker-compose.prod.yml logs --tail=100

The compose stack exposes only HTTP port 80 on the EC2 host. CloudFront terminates viewer HTTPS and adds the custom origin token header. Nginx serves the React SPA, routes /api/ to FastAPI, and rejects origin requests without the token. PostgreSQL is not published on a host port.

## 5. Get the public URL and test

In CloudFormation → your stack → Outputs, copy PublicApplicationUrl. It should look like:

    https://dxxxxxxxxxxxxx.cloudfront.net

Test:

- Open the public URL and register/login.
- Upload a new file and verify its API response has storage_backend: "s3".
- Download the file.
- Create a share link. It should begin with the CloudFront HTTPS hostname.
- Open the link in a private/incognito window or on a second device.
- Delete the test file and confirm that it disappears from S3.

The old localhost share links will remain localhost links. Create new links from the deployed public application.

## Updating the deployed application

After pulling the desired branch on the EC2 instance:

    cd /opt/cloudsync
    git fetch origin
    git checkout feature/python-fastapi-migration
    git pull --ff-only origin feature/python-fastapi-migration
    docker compose -f docker-compose.prod.yml up -d --build

If a new version changes the database schema, review and back up the database before applying any migration.

## Back up PostgreSQL

Run from the EC2 shell:

    cd /opt/cloudsync
    docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres -d cloudsync > cloudsync-backup.sql

Copy the backup to a protected location before instance replacement or stack deletion. A production setup should automate encrypted off-instance database backups.

## Tear down

To stop containers but keep the EC2 instance and its Docker volume:

    cd /opt/cloudsync
    docker compose -f docker-compose.prod.yml down

This stops the application; public share links will no longer work.

Deleting the CloudFormation stack terminates the EC2 instance and deletes its root EBS volume, including the PostgreSQL Docker volume. Back up the database first. The separately created S3 bucket and its objects are not deleted by this stack.

## Security boundaries

- S3 bucket remains private with Block Public Access enabled.
- EC2 uses an IAM instance role with only object upload/read/delete permissions on the configured bucket plus the SSM managed policy.
- No SSH port is opened; use Session Manager.
- Database port 5432 is internal to Docker only.
- CloudFront provides the public HTTPS hostname. Nginx requires a custom origin token for direct-origin protection.
- The CloudFront-to-EC2 origin connection is HTTP inside AWS; viewer-to-CloudFront traffic is HTTPS. For higher-assurance deployments, use CloudFront VPC origins or a private origin over HTTPS.
- The CloudFront domain is a public AWS-managed hostname, so you do not need to purchase a custom domain for this demo.
