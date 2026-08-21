import os
import logging
from logging.handlers import RotatingFileHandler

LOG_LEVEL = "INFO"
LOG_FILE = "logs/sv_logger.log"

# Ensure logs directory exists
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if not hasattr(record, "request_id"):
            record.request_id = "-"
        if not hasattr(record, "operation"):
            record.operation = "-"
        if not hasattr(record, "entity"):
            record.entity = "-"
        if not hasattr(record, "identifier"):
            record.identifier = "-"
        return True


formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(request_id)s - %(operation)s - %(entity)s - %(identifier)s - %(message)s"
)

sv_logger = logging.getLogger("sv_logger")
sv_logger.setLevel(LOG_LEVEL)
sv_logger.propagate = False

if not sv_logger.handlers:
    file_handler = RotatingFileHandler(
        LOG_FILE,
        maxBytes=10**6,  # 1 MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(LOG_LEVEL)
    file_handler.addFilter(RequestIdFilter())

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(LOG_LEVEL)
    console_handler.addFilter(RequestIdFilter())

    sv_logger.addHandler(file_handler)
    sv_logger.addHandler(console_handler)
