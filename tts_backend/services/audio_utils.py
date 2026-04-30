import io
import wave
import struct


def adjust_volume(wav_bytes: bytes, volume: float) -> bytes:
    """
    Điều chỉnh âm lượng của WAV audio.
    volume=1.0  → giữ nguyên
    volume=0.5  → giảm 50%
    volume=2.0  → tăng gấp đôi (có thể clip nếu quá lớn)
    """
    if abs(volume - 1.0) < 0.01:
        return wav_bytes

    try:
        buf = io.BytesIO(wav_bytes)
        with wave.open(buf, "rb") as wf:
            params      = wf.getparams()
            raw_frames  = wf.readframes(params.nframes)

        sample_width = params.sampwidth  # bytes per sample: 1, 2, or 4
        fmt_map = {1: "b", 2: "h", 4: "i"}
        fmt = fmt_map.get(sample_width, "h")

        n_samples = params.nframes * params.nchannels
        samples   = list(struct.unpack(f"{n_samples}{fmt}", raw_frames))

        max_val   = (1 << (sample_width * 8 - 1)) - 1
        min_val   = -(max_val + 1)
        adjusted  = [
            max(min_val, min(max_val, int(s * volume)))
            for s in samples
        ]

        new_frames = struct.pack(f"{n_samples}{fmt}", *adjusted)

        out = io.BytesIO()
        with wave.open(out, "wb") as wf_out:
            wf_out.setparams(params)
            wf_out.writeframes(new_frames)

        return out.getvalue()

    except Exception:
        # Nếu xử lý WAV thất bại, trả nguyên bản
        return wav_bytes
