from fastapi import HTTPException


def linux_call(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except HTTPException:
        raise
    except Exception as exc:
        message = str(exc).strip() or "Command failed"
        raise HTTPException(status_code=500, detail=message) from exc
