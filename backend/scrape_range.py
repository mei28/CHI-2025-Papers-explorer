import requests
from bs4 import BeautifulSoup
import re
import time
import json
import requests
from backend.core.scraper import scrape_sigchi_content

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
        soup = BeautifulSoup(html, 'html.parser')

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

def scrape_id_range(start_id, end_id, sleep_time=0.5):
    """
    指定した範囲のIDについてスクレイピングを行い、有効なデータのみをリストにまとめます。
    ここでは、まず HEAD リクエストでページの存在を確認し、存在する場合のみ Selenium を起動します。

    Args:
        start_id (int): スクレイピング開始のID
        end_id (int): スクレイピング終了のID
        sleep_time (float): 各リクエストの間に入れる待機時間（秒）

    Returns:
        list: 有効なデータの辞書のリスト
    """
    results = []
    base_url = "https://programs.sigchi.org/chi/2025/program/content"
    for content_id in range(start_id, end_id + 1):
        url = f"{base_url}/{content_id}"
        print(f"Checking content ID: {content_id}")
        if page_exists(url):
            print("  Page does not exist. Skipping.")
            time.sleep(sleep_time)
            continue

        print("  Page exists. Scraping...")
        data = scrape_sigchi_content(content_id)
        if data is not None and data.get("title"):
            results.append(data)
            print(f"  Valid data found: {data['title']}")
        else:
            print("  No valid data.")
        time.sleep(sleep_time)
    return results

def save_to_json(data, filename="scraped_data.json"):
    """
    スクレイピングしたデータを JSON ファイルに保存します。

    Args:
        data (list): 保存するデータのリスト
        filename (str): 保存先のファイル名
    """
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"Data saved to {filename}")

if __name__ == "__main__":
    start_id = 188582
    end_id = 188585
    scraped_results = scrape_id_range(start_id, end_id, sleep_time=0.5)
    save_to_json(scraped_results, "scraped_data.json")

