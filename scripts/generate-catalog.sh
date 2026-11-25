
#!/bin/zsh

set -e

cd "$(dirname "$0")/.."

python3 - <<'PY'
import json
from pathlib import Path

root = Path.cwd()
catalog = []

# 排除网站程序目录
excluded = {
    "scripts", "assets", "css", "js",
    "images", "node_modules"
}

for folder in sorted(root.iterdir()):
    if not folder.is_dir():
        continue
    if folder.name.startswith(".") or folder.name in excluded:
        continue

    files = []

    for file in sorted(folder.rglob("*")):
        if not file.is_file():
            continue

        relative = file.relative_to(root)

        if any(part.startswith(".") for part in relative.parts):
            continue

        files.append({
            "name": file.name,
            "path": relative.as_posix(),
            "type": file.suffix.lstrip(".").lower() or "file"
        })

    catalog.append({
        "name": folder.name,
        "description": f"{folder.name} course resources",
        "files": files
    })

output = root / "catalog.js"

output.write_text(
    "window.RESOURCE_CATALOG = " +
    json.dumps(catalog, ensure_ascii=False, indent=4) +
    ";\n",
    encoding="utf-8"
)

print(f"生成成功：{output}")
print(f"课程数量：{len(catalog)}")
print(f"资源数量：{sum(len(c['files']) for c in catalog)}")
PY
