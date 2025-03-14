import os
import time
import json
import requests
from backend.core.scraper import scrape_sigchi_content
from pprint import pprint
from bs4 import BeautifulSoup

OUTPUT_FILENAME = "data/scraped_data_0314.json"


def page_exists(url, timeout=10):
    """
    指定した URL に対して GET リクエストを行い、
    ページ内に <h2 class="full-name">The ACM CHI conference on Human Factors in Computing Systems</h2>
    が含まれていれば存在しないと判定します。

    Args:
        url (str): チェックする URL
        timeout (int): タイムアウト秒数

    Returns:
        bool: ページが存在すれば True、存在しなければ False
    """
    try:
        response = requests.get(url, allow_redirects=True, timeout=timeout)
        if response.status_code != 200:
            return False

        html = response.text
        soup = BeautifulSoup(html, "html.parser")

        # メインページのマーカーとなる h2.full-name をチェック
        full_name_elem = soup.select_one("h2.full-name")
        if full_name_elem:
            full_name_text = full_name_elem.get_text(strip=True)
            if "The ACM CHI conference on Human Factors in Computing Systems" in full_name_text:
                # これが含まれている場合、該当ページはコンテンツページではなくメインページ
                return False

        # 他にも h3.content-title などでチェックする方法も併用可能です
        title_elem = soup.select_one("h3.content-title")
        if not title_elem or not title_elem.get_text(strip=True):
            return False

        return True
    except Exception as e:
        print(f"Error checking page {url}: {e}")
        return False


def load_existing_data(filename):
    """
    既存のJSONファイルがあれば読み込む。なければ空リストを返す。
    """
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                return data
            except Exception as e:
                print(f"Error loading {filename}: {e}")
                return []
    else:
        return []


def save_to_json(data, filename=OUTPUT_FILENAME):
    """
    データをJSONファイルに保存する
    """
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"Data saved to {filename}")


def scrape_id_range(start_id, end_id, sleep_time=0.5, save_interval=10):
    """
    指定したID範囲のページについて、存在チェック後にスクレイピングを実施。
    すでに取得済みのIDはスキップし、一定件数ごとに結果をファイルに保存する。
    """
    # 既存データを読み込み、取得済みのIDをセットで管理
    results = load_existing_data(OUTPUT_FILENAME)
    scraped_ids = {entry["id"] for entry in results}

    base_url = "https://programs.sigchi.org/chi/2025/program/content"
    count = 0
    for content_id in range(start_id, end_id + 1):
        print(f"Checking content ID: {content_id}")
        if content_id in scraped_ids:
            print("  Already scraped. Skipping.")
            continue

        url = f"{base_url}/{content_id}"
        # ページ存在チェック（存在しない＝メインページへリダイレクトなどの場合）
        if page_exists(url):
            print("  Page does not exist (or redirect to main page). Skipping.")
            time.sleep(sleep_time)
            continue

        print("  Page exists. Scraping...")
        data = scrape_sigchi_content(content_id)
        if data is not None and data.get("title"):
            results.append(data)
            scraped_ids.add(content_id)
            print(f"  Valid data found: {data['title']}")
        else:
            print("  No valid data.")

        count += 1
        time.sleep(sleep_time)
        if count % save_interval == 0:
            save_to_json(results, OUTPUT_FILENAME)
            print("Intermediate data saved.")

    return results


if __name__ == "__main__":
    # 例: ID 188211 ～ 189669 を対象
    start_id = 188211
    end_id = 189669
    scraped_results = scrape_id_range(start_id, end_id, sleep_time=0.5, save_interval=10)
    save_to_json(scraped_results, OUTPUT_FILENAME)
    pprint(scraped_results)
