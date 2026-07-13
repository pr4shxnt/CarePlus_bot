import asyncio
import logging
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

logger = logging.getLogger("careplus.tts")

BASE_DIR = Path(__file__).resolve().parents[2]  # hardwares/bot_1/
DEFAULT_MODEL = BASE_DIR / "models" / "ne_NP-chitwan-medium.onnx"
DEFAULT_CONFIG = BASE_DIR / "models" / "ne_NP-chitwan-medium.onnx.json"

MODEL_PATH = Path(os.getenv("PIPER_MODEL", str(DEFAULT_MODEL)))
CONFIG_PATH = Path(os.getenv("PIPER_CONFIG", str(DEFAULT_CONFIG)))


def _resolve_piper_cmd():
    piper_env = os.getenv("PIPER_BIN")
    piper_venv_python = BASE_DIR.parent / "piperapi" / "tts-env" / "bin" / "python"

    if piper_env and Path(piper_env).exists():
        return [piper_env]
    if piper_venv_python.exists():
        # Use python -m piper to bypass broken shebangs in moved venvs
        return [str(piper_venv_python), "-m", "piper"]
    piper_path = shutil.which("piper")
    if piper_path:
        return [piper_path]
    raise RuntimeError("Piper executable not found.")


async def synthesize_speech(text: str) -> bytes:
    """Synthesize `text` to WAV bytes via the Piper CLI.

    Raises ValueError for bad input, RuntimeError for synthesis failures.
    """
    if not text or not text.strip():
        raise ValueError("Text for TTS cannot be empty")
    if not MODEL_PATH.exists() or not CONFIG_PATH.exists():
        raise RuntimeError("Piper model/config not found")

    piper_cmd = _resolve_piper_cmd()

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
        output_path = Path(temp_audio.name)

    def run_piper():
        full_cmd = piper_cmd + [
            "--model", str(MODEL_PATH),
            "--config", str(CONFIG_PATH),
            "--output_file", str(output_path),
        ]
        return subprocess.run(
            full_cmd,
            input=text,
            capture_output=True,
            text=True,
            check=True,
        )

    try:
        await asyncio.to_thread(run_piper)
        return output_path.read_bytes()
    except subprocess.CalledProcessError as exc:
        logger.error(f"Piper failed: {exc.stderr}")
        raise RuntimeError(f"Piper failed: {exc.stderr}") from exc
    except Exception as exc:
        logger.exception("Piper CLI failed")
        raise RuntimeError(f"Piper error: {exc}") from exc
    finally:
        output_path.unlink(missing_ok=True)
