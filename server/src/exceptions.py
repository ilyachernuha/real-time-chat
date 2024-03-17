from fastapi.exceptions import HTTPException


class FieldSubmitError(HTTPException):
    def __init__(self, status_code: int, detail: str, field: str):
        super().__init__(status_code=status_code, detail=detail)
        self.field = field


class AccessTokenValidationError(Exception):
    def __init__(self, message: str):
        super().__init__(message)


class BearerTokenExtractionError(Exception):
    def __init__(self, message: str):
        super().__init__(message)
