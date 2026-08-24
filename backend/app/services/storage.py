import os
import uuid
from fastapi import UploadFile
from app.config import settings

class LocalStorageService:
    def __init__(self, upload_dir: str = settings.UPLOAD_DIR):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_file(self, file: UploadFile) -> tuple[str, str]:
        """
        Saves uploaded file to disk and returns (file_id, preview_url).
        """
        extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        file_id = str(uuid.uuid4())
        saved_filename = f"{file_id}{extension}"
        filepath = os.path.join(self.upload_dir, saved_filename)

        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)

        preview_url = f"/uploads/{saved_filename}"
        return file_id, preview_url

    def delete_file(self, preview_url: str) -> bool:
        """
        Deletes file associated with preview_url.
        """
        if not preview_url or not preview_url.startswith("/uploads/"):
            return False
        filename = os.path.basename(preview_url)
        filepath = os.path.join(self.upload_dir, filename)
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
                return True
            except OSError:
                return False
        return False

storage_service = LocalStorageService()
