"""
serve.py — 支援 HTTP Range 請求的迷你靜態 server。
為什麼需要？Python 內建 http.server 不支援 Range，
所以影片只能順序播放、無法用滑鼠拖移進度條。

用法（在 ai-report 資料夾內跑）：
    python serve.py            # 預設 0.0.0.0:8766（本機 + 內網 + 公開）
    python serve.py 9000       # 指定 port
    HOST=127.0.0.1 python serve.py    # 改成只接受本機（私密）

內網存取：
    1. 啟動後查筆電 IP：ipconfig | findstr IPv4
    2. 其他裝置開：http://你的IP:8766/
    3. 第一次連 Windows 可能跳防火牆對話框，按「允許」

驗證 Range 有效：
    在另一個終端跑：
    curl -v -H "Range: bytes=100-200" http://127.0.0.1:8766/media/codex-fix-pc.mp4 -o nul
    應該看到 "HTTP/1.0 206 Partial Content" 與 "Content-Range: bytes 100-200/..."
"""
import os
import re
import sys
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler, ThreadingHTTPServer


# 快取策略：依副檔名決定 Cache-Control
# - 媒體 / 字體 / 圖片：可快取 1 小時（重整時瀏覽器直接拿 cache）
# - HTML / CSS / JS：no-cache（瀏覽器可存但會 revalidate，改檔即時生效）
# - 其他：no-store
CACHE_LONG = {".mp4", ".webm", ".mov", ".m4v", ".png", ".jpg", ".jpeg",
              ".webp", ".gif", ".ico", ".woff2", ".woff", ".ttf", ".otf"}
CACHE_REVALIDATE = {".html", ".htm", ".css", ".js", ".json"}


def cache_header_for(path):
    ext = os.path.splitext(path)[1].lower()
    if ext in CACHE_LONG:
        return "public, max-age=3600"
    if ext in CACHE_REVALIDATE:
        return "no-cache"
    return "no-store"


class RangeHandler(SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler + HTTP Range support (RFC 7233)."""

    # 確保影片 mime 對
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".mp4":  "video/mp4",
        ".webm": "video/webm",
        ".mov":  "video/quicktime",
        ".m4v":  "video/x-m4v",
        ".webp": "image/webp",
    }

    def log_message(self, format, *args):
        # 簡化 log
        sys.stdout.write(f"  {self.command} {self.path}  →  {args[1] if len(args) > 1 else ''}\n")

    def do_GET(self):
        # 把 query string / fragment 砍掉
        path_only = self.path.split("?", 1)[0].split("#", 1)[0]
        fs_path = self.translate_path(path_only)

        if os.path.isdir(fs_path):
            return super().do_GET()
        if not os.path.isfile(fs_path):
            self.send_error(404, "Not Found")
            return

        try:
            f = open(fs_path, "rb")
        except OSError:
            self.send_error(404, "Not Found")
            return

        try:
            file_size = os.fstat(f.fileno()).st_size
            range_header = self.headers.get("Range")
            ctype = self.guess_type(fs_path)

            if range_header:
                m = re.match(r"bytes=(\d*)-(\d*)", range_header)
                if not m:
                    self.send_error(400, "Bad Range")
                    return
                start_s, end_s = m.group(1), m.group(2)
                if start_s:
                    start = int(start_s)
                    end = int(end_s) if end_s else file_size - 1
                else:
                    suffix = int(end_s)
                    start = max(0, file_size - suffix)
                    end = file_size - 1
                end = min(end, file_size - 1)
                if start > end or start >= file_size:
                    self.send_response(416)
                    self.send_header("Content-Range", f"bytes */{file_size}")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    return
                length = end - start + 1

                self.send_response(206)
                self.send_header("Content-Type", ctype)
                self.send_header("Accept-Ranges", "bytes")
                self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                self.send_header("Content-Length", str(length))
                self.send_header("Cache-Control", cache_header_for(fs_path))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()

                f.seek(start)
                bytes_left = length
                while bytes_left > 0:
                    chunk = f.read(min(64 * 1024, bytes_left))
                    if not chunk:
                        break
                    try:
                        self.wfile.write(chunk)
                    except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                        return
                    bytes_left -= len(chunk)
                return

            # 沒帶 Range
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Length", str(file_size))
            self.send_header("Cache-Control", cache_header_for(fs_path))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            try:
                while True:
                    chunk = f.read(64 * 1024)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                return
        finally:
            f.close()


def port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
            return False
        except OSError:
            return True


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
    here = os.path.dirname(os.path.abspath(__file__))
    os.chdir(here)

    if port_in_use(port):
        print(f"❌ port {port} 已被佔用（可能是舊的 server 還沒關）")
        print(f"   找到並關掉舊 server，或者用 `python serve.py {port + 1}` 換 port")
        sys.exit(1)

    # 0.0.0.0 = 接受本機 + 內網 + VPS 公開連線（預設）
    # 127.0.0.1 = 只接受本機（私密）
    # 想改回私密，設 HOST=127.0.0.1 環境變數
    host = os.environ.get("HOST", "0.0.0.0")
    server = ThreadingHTTPServer((host, port), RangeHandler)
    public = host in ("0.0.0.0", "")
    print("=" * 60)
    print(f"  📺 Range-aware server")
    print(f"  📁 serving: {here}")
    if public:
        print(f"  🌐 http://<your-server-ip>:{port}/  (公開模式)")
        print(f"  🌐 http://127.0.0.1:{port}/         (本機)")
    else:
        print(f"  🌐 http://127.0.0.1:{port}/")
    print(f"  ✓ HTTP Range 已啟用 — 影片可拖移進度條")
    print("=" * 60)
    print("\n  Ctrl+C 結束\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  bye 👋")


if __name__ == "__main__":
    main()
