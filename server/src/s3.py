import aiobotocore.session
import os
from dotenv import load_dotenv
from io import BytesIO


load_dotenv()

aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
s3_region = os.getenv("S3_REGION")
bucket_name = os.getenv("S3_BUCKET_NAME")


class S3:
    __client_initialized = False
    __session = None
    __client_context = None
    __client = None

    @staticmethod
    async def create_client():
        S3.__session = aiobotocore.session.get_session()
        S3.__client_context = S3.__session.create_client(
            service_name="s3",
            aws_secret_access_key=aws_secret_access_key,
            aws_access_key_id=aws_access_key_id,
            region_name=s3_region
        )
        S3.__client = await S3.__client_context.__aenter__()
        S3.__client_initialized = True

    @staticmethod
    async def close_client():
        if S3.__client_initialized:
            await S3.__client_context.__aexit__(None, None, None)
            S3.__client = None
            S3.__client_context = None
            S3.__session = None
            S3.__client_initialized = False

    @staticmethod
    async def upload_file(file: BytesIO, filename: str):
        file.seek(0)
        await S3.__client.put_object(Body=file, Bucket=bucket_name, Key=filename)

    @staticmethod
    async def generate_presigned_url(filename: str):
        return await S3.__client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket_name, "Key": filename},
            ExpiresIn=1000
        )

    @staticmethod
    async def delete_file(filename: str):
        await S3.__client.delete_object(Bucket=bucket_name, Key=filename)
