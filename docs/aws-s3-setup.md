# Configure Amazon S3 for CloudSync

CloudSync supports two file-storage backends:

- `local`: stores uploaded bytes under `backend/uploads/`. This is the default and requires no AWS account.
- `s3`: stores new uploads in a private Amazon S3 bucket. PostgreSQL continues to store file metadata and the selected storage backend for each file.

The React app uses the same FastAPI endpoints for either backend. S3 objects are never made public; FastAPI checks the authenticated owner or share token and streams the object to the caller.

## 1. Create a private S3 bucket

In the AWS Console, open **Amazon S3 → Create bucket**.

Use these settings:

- Bucket type: General purpose.
- AWS Region: use the same Region as `AWS_REGION`; this guide uses `ap-south-1` (Asia Pacific — Mumbai).
- Bucket name: choose a globally unique name, for example `cloudsync-your-suffix`.
- Object Ownership: Bucket owner enforced (ACLs disabled).
- Block all public access: keep all four settings enabled.
- Default encryption: enable server-side encryption with Amazon S3 managed keys (SSE-S3).

Do not add a public bucket policy and do not grant public read access. S3 Block Public Access should remain enabled.

## 2. Give the application least-privilege access

Create or use a dedicated IAM identity for CloudSync. Do not use root account access keys.

Attach a policy scoped to the one bucket. Replace `YOUR_BUCKET_NAME` with the exact bucket name:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudSyncBucketObjects",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

The current API does not list bucket contents, change bucket configuration, or set object ACLs, so those permissions are not needed.

For deployed workloads on AWS, attach this policy to an IAM role and let Boto3 obtain temporary role credentials. For local development, use an AWS CLI named profile or your organization's IAM Identity Center profile. Never paste AWS keys into source code or `.env`.

## 3. Configure AWS CLI credentials on Windows

First verify whether AWS CLI is installed:

```bash
aws --version
```

If your organization uses IAM Identity Center (recommended for workforce access), configure a named SSO profile using the instructions from your AWS administrator:

```bash
aws configure sso --profile cloudsync
aws sso login --profile cloudsync
```

If you have been explicitly issued programmatic IAM credentials for local development, configure a named profile instead:

```bash
aws configure --profile cloudsync
```

Do not create access keys for the AWS root user.

Verify which AWS identity the profile uses:

```bash
aws sts get-caller-identity --profile cloudsync
```

This command should identify the dedicated IAM user or assumed role you expect. Do not share its output if it contains account or identity details.

## 4. Set the backend environment variables

Open `backend/.env`. Change only the storage settings:

```env
STORAGE_BACKEND=s3
AWS_REGION=ap-south-1
AWS_S3_BUCKET=YOUR_BUCKET_NAME
```

Keep your database and JWT settings unchanged. Do not add AWS access keys to this file.

In the same Git Bash terminal that will run Uvicorn, select the named profile:

```bash
export AWS_PROFILE=cloudsync
```

If you use a different profile name, replace `cloudsync` accordingly.

## 5. Restart the backend

Stop the currently running backend with `CTRL+C`. From the `backend/` directory with the virtual environment active:

```bash
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

No frontend setting changes are required. Keep the React app running and use the dashboard as usual.

## 6. Verify the S3 flow

1. Sign in to CloudSync.
2. Upload a small test file.
3. In the dashboard, confirm the file is listed. Its API response should show `storage_backend: "s3"`.
4. Download it through CloudSync.
5. Create a share link and test it in an incognito window.
6. Delete the test file through CloudSync.
7. Confirm that the object is no longer present in the bucket.

New uploads go to S3 while `STORAGE_BACKEND=s3`. Existing records keep their own `storage_backend` value, so files uploaded before switching remain in local storage and continue to download from there. Switching the setting does not migrate old files.

To switch back to local storage, set `STORAGE_BACKEND=local` and restart the backend. Files already uploaded to S3 remain in S3 and are still served from S3 because their database records retain `storage_backend=s3`.

## Notes

- The API currently limits each upload to 50 MB by default. Configure `MAX_UPLOAD_SIZE_MB` in `backend/.env` to change it.
- S3 storage, API requests, and data transfer can incur AWS charges. Delete test objects when finished and check the AWS pricing page for your Region.
- Keep Block Public Access enabled. FastAPI streams private S3 objects after checking the user's ownership or share token.
- This project uses Boto3's standard credential provider chain. Do not commit `backend/.env`, AWS credential files, session tokens, or access keys.
- S3 versioning, lifecycle policies, malware scanning and multipart upload orchestration are not part of this MVP yet.

## Official AWS references

- [Boto3 credentials and credential provider chain](https://docs.aws.amazon.com/boto3/latest/guide/credentials.html)
- [Boto3 S3 PutObject](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/put_object.html)
- [Boto3 S3 GetObject](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/get_object.html)
- [Boto3 S3 DeleteObject](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/delete_object.html)
- [Amazon S3 Block Public Access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html)
- [Amazon S3 pricing](https://aws.amazon.com/s3/pricing/)
