# backend/app/core/storage.py
"""
Cloudflare R2 / S3-compatible storage client.
Handles file upload, download, deletion, and presigned URLs.
"""

import os
from datetime import datetime, timezone
from typing import Any, BinaryIO
from uuid import uuid4

import boto3  # type: ignore[import-untyped]
from botocore.config import Config  # type: ignore[import-untyped]
from botocore.exceptions import ClientError  # type: ignore[import-untyped]

from app.core.config import settings


class StorageClient:
    """S3-compatible storage client for Cloudflare R2."""

    def __init__(self):
        r2_account = settings.R2_ACCOUNT_ID or "mock-account"
        r2_access = settings.R2_ACCESS_KEY_ID or "mock-key"
        r2_secret = settings.R2_SECRET_ACCESS_KEY or "mock-secret"
        bucket_name = settings.R2_BUCKET_NAME or "bidcompliance-docs"
        public_url = (settings.R2_PUBLIC_URL or "http://localhost:9000").rstrip("/")
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=f"https://{r2_account}.r2.cloudflarestorage.com",
            aws_access_key_id=r2_access,
            aws_secret_access_key=r2_secret,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
        self.bucket = bucket_name
        self.public_url = public_url

    def _generate_key(self, original_filename: str, folder: str = "uploads") -> str:
        """Generate a unique storage key."""
        ext = os.path.splitext(original_filename)[1].lower()
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d")
        unique_id = uuid4().hex[:12]
        return f"{folder}/{timestamp}/{unique_id}{ext}"

    def upload_file(
        self,
        file_obj: BinaryIO,
        original_filename: str,
        folder: str = "uploads",
        content_type: str | None = None,
        metadata: dict | None = None,
    ) -> dict:
        """
        Upload a file to R2.
        Returns dict with key, url, size, content_type.
        """
        key = self._generate_key(original_filename, folder)
        size = 0

        # Get file size
        file_obj.seek(0, os.SEEK_END)
        size = file_obj.tell()
        file_obj.seek(0)

        # Validate size
        if size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise ValueError(f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit")

        # Validate extension
        ext = os.path.splitext(original_filename)[1].lower().lstrip(".")
        if ext not in settings.ALLOWED_FILE_TYPES:
            raise ValueError(f"File type .{ext} not allowed. Allowed: {settings.ALLOWED_FILE_TYPES}")

        extra_args: dict[str, Any] = {}
        if content_type:
            extra_args["ContentType"] = content_type
        if metadata:
            extra_args["Metadata"] = metadata

        try:
            self.s3_client.upload_fileobj(file_obj, self.bucket, key, ExtraArgs=extra_args)
        except ClientError as e:
            raise RuntimeError(f"Upload failed: {e}")

        return {
            "key": key,
            "url": f"{self.public_url}/{key}",
            "size": size,
            "content_type": content_type or self._guess_content_type(original_filename),
            "bucket": self.bucket,
        }

    def upload_bytes(
        self,
        data: bytes,
        original_filename: str,
        folder: str = "uploads",
        content_type: str | None = None,
        metadata: dict | None = None,
    ) -> dict:
        """Upload bytes directly."""
        from io import BytesIO
        return self.upload_file(BytesIO(data), original_filename, folder, content_type, metadata)

    def download_file(self, key: str) -> bytes:
        """Download file contents as bytes."""
        try:
            response = self.s3_client.get_object(Bucket=self.bucket, Key=key)
            return response["Body"].read()
        except ClientError as e:
            if e.response["Error"]["Code"] == "NoSuchKey":
                raise FileNotFoundError(f"File not found: {key}")
            raise RuntimeError(f"Download failed: {e}")

    def delete_file(self, key: str) -> bool:
        """Delete a file from R2."""
        try:
            self.s3_client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError as e:
            raise RuntimeError(f"Delete failed: {e}")

    def delete_files(self, keys: list[str]) -> dict:
        """Delete multiple files."""
        if not keys:
            return {"deleted": 0, "errors": []}

        try:
            objects = [{"Key": k} for k in keys]
            response = self.s3_client.delete_objects(
                Bucket=self.bucket,
                Delete={"Objects": objects, "Quiet": False}
            )
            return {
                "deleted": len(response.get("Deleted", [])),
                "errors": response.get("Errors", []),
            }
        except ClientError as e:
            raise RuntimeError(f"Batch delete failed: {e}")

    def get_presigned_url(
        self,
        key: str,
        expiration: int = 3600,
        method: str = "get_object",
    ) -> str:
        """Generate a presigned URL for temporary access."""
        try:
            return self.s3_client.generate_presigned_url(
                ClientMethod=method,
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expiration,
            )
        except ClientError as e:
            raise RuntimeError(f"Presigned URL generation failed: {e}")

    def get_upload_presigned_url(
        self,
        key: str,
        expiration: int = 3600,
        content_type: str | None = None,
    ) -> dict:
        """Generate presigned POST URL for direct browser upload."""
        try:
            conditions: list[Any] = [
                ["content-length-range", 0, settings.MAX_FILE_SIZE_MB * 1024 * 1024],
            ]
            if content_type:
                conditions.append({"Content-Type": content_type})

            post = self.s3_client.generate_presigned_post(
                Bucket=self.bucket,
                Key=key,
                Fields={"Content-Type": content_type} if content_type else None,
                Conditions=conditions,
                ExpiresIn=expiration,
            )
            return {
                "url": post["url"],
                "fields": post["fields"],
                "key": key,
                "expires_in": expiration,
            }
        except ClientError as e:
            raise RuntimeError(f"Presigned POST generation failed: {e}")

    def file_exists(self, key: str) -> bool:
        """Check if a file exists."""
        try:
            self.s3_client.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                return False
            raise RuntimeError(f"Head object failed: {e}")

    def get_file_info(self, key: str) -> dict:
        """Get file metadata without downloading."""
        try:
            response = self.s3_client.head_object(Bucket=self.bucket, Key=key)
            return {
                "key": key,
                "size": response["ContentLength"],
                "content_type": response.get("ContentType"),
                "last_modified": response["LastModified"],
                "etag": response["ETag"].strip('"'),
                "metadata": response.get("Metadata", {}),
            }
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                raise FileNotFoundError(f"File not found: {key}")
            raise RuntimeError(f"Head object failed: {e}")

    def list_files(self, prefix: str = "", max_keys: int = 1000) -> list[dict]:
        """List files with given prefix."""
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket,
                Prefix=prefix,
                MaxKeys=max_keys,
            )
            files = []
            for obj in response.get("Contents", []):
                files.append({
                    "key": obj["Key"],
                    "size": obj["Size"],
                    "last_modified": obj["LastModified"],
                    "etag": obj["ETag"].strip('"'),
                    "url": f"{self.public_url}/{obj['Key']}",
                })
            return files
        except ClientError as e:
            raise RuntimeError(f"List objects failed: {e}")

    def _guess_content_type(self, filename: str) -> str:
        """Guess MIME type from extension."""
        ext = os.path.splitext(filename)[1].lower()
        types = {
            ".pdf": "application/pdf",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".tiff": "image/tiff",
            ".tif": "image/tiff",
        }
        return types.get(ext, "application/octet-stream")


# Global storage client instance
storage = StorageClient()