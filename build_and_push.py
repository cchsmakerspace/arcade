import os
import json
import shutil
import subprocess

# Paths
REPO_DIR         = r"S:\MakerspaceArcade"
SOURCE_SHOWCASE  = r"S:\Library\Arcade"
SOURCE_SANDBOX   = r"S:\Projects\Arcade"

DEST_SHOWCASE    = os.path.join(REPO_DIR, "showcase")
DEST_SANDBOX     = os.path.join(REPO_DIR, "sandbox")
OUTPUT_JSON      = os.path.join(REPO_DIR, "games.json")

def sync_and_scan(source_path, dest_path, category):
    games = []
    if not os.path.exists(source_path):
        print(f"[WARNING] Source path not found: {source_path}")
        return games

    # Recreate local destination folder so deleted games are removed from GitHub too
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path)
    os.makedirs(dest_path, exist_ok=True)

    items = sorted(os.listdir(source_path))
    for item in items:
        src_folder = os.path.join(source_path, item)
        if not os.path.isdir(src_folder):
            continue

        index_path = os.path.join(src_folder, "index.html")
        meta_path  = os.path.join(src_folder, "meta.json")

        # Default metadata
        title = item.replace("_", " ").title()
        developer = "Unknown"
        ai = "Unknown"
        date = "Unknown"
        external_url = None

        if os.path.isfile(meta_path):
            try:
                with open(meta_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    title = data.get("title", title)
                    developer = data.get("developer", developer)
                    ai = data.get("ai", ai)
                    date = data.get("date", date)
                    external_url = data.get("url", None)
            except Exception as e:
                print(f"[WARNING] Error reading meta.json in {category}/{item}: {e}")

        # Skip folders that have neither an index.html nor an external URL
        if not external_url and not os.path.isfile(index_path):
            continue

        # Copy game folder into the GitHub repo
        dst_folder = os.path.join(dest_path, item)
        if external_url:
            # For externally hosted games, only copy icon/meta (skip heavy build folders if present)
            os.makedirs(dst_folder, exist_ok=True)
            for asset in ("icon.png", "icon.jpg", "meta.json"):
                src_file = os.path.join(src_folder, asset)
                if os.path.isfile(src_file):
                    shutil.copy2(src_file, os.path.join(dst_folder, asset))
            game_url = external_url
        else:
            # Copy the full p5.js game folder
            shutil.copytree(src_folder, dst_folder)
            game_url = f"{category}/{item}/index.html"

        # Icon discovery (relative paths for GitHub Pages)
        icon_url = "assets/default_icon.png"
        if os.path.isfile(os.path.join(dst_folder, "icon.png")):
            icon_url = f"{category}/{item}/icon.png"
        elif os.path.isfile(os.path.join(dst_folder, "icon.jpg")):
            icon_url = f"{category}/{item}/icon.jpg"

        games.append({
            "id": f"{category}_{item}",
            "folderName": item,
            "title": title,
            "developer": developer,
            "ai": ai,
            "date": date,
            "iconUrl": icon_url,
            "url": game_url
        })

    return games

def main():
    print("Syncing games from S: drive into S:\\MakerspaceArcade...")
    manifest = {
        "showcase": sync_and_scan(SOURCE_SHOWCASE, DEST_SHOWCASE, "showcase"),
        "sandbox": sync_and_scan(SOURCE_SANDBOX, DEST_SANDBOX, "sandbox")
    }

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)

    total = len(manifest["showcase"]) + len(manifest["sandbox"])
    print(f"Synced and indexed {total} game(s) into games.json.")

    # Push to GitHub
    print("Pushing updates to GitHub...")
    try:
        subprocess.run(["git", "add", "."], cwd=REPO_DIR, check=True)
        status = subprocess.run(["git", "status", "--porcelain"], cwd=REPO_DIR, capture_output=True, text=True)
        if status.stdout.strip():
            subprocess.run(["git", "commit", "-m", "Update arcade catalog"], cwd=REPO_DIR, check=True)
            subprocess.run(["git", "push"], cwd=REPO_DIR, check=True)
            print("Successfully pushed to GitHub! Live site will update in ~30-60 seconds.")
        else:
            print("No changes detected since last push.")
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Git command failed: {e}")

if __name__ == "__main__":
    main()
    input("\nPress Enter to close...")