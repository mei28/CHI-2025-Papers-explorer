from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from pprint import pprint
import time
import re

# --- 各種セレクター・抽出ルール ---
TITLE_SELECTOR = "h3.content-title"
ABSTRACT_SELECTOR = "p.p-small"  # abstractは、Authorsブロック外の p.p-small を対象

def extract_title(soup):
    elem = soup.select_one(TITLE_SELECTOR)
    return elem.get_text(strip=True) if elem else None

def extract_abstract(soup):
    """
    white-block 内で、<h4> に "Abstract" が含まれるブロックから
    <p class="p-small"> のテキストを抽出します。
    """
    for block in soup.find_all("white-block"):
        header = block.find("h4")
        if header and "Abstract" in header.get_text():
            p = block.find("p", class_="p-small")
            if p:
                return p.get_text(strip=True)
    return None

def extract_authors(soup):
    authors = []
    # Authorsブロック：white-block 内で、h4 に "Authors" が含まれるブロックを対象
    for block in soup.find_all("white-block"):
        header = block.find("h4")
        if header and "Authors" in header.get_text():
            for card in block.find_all("person-card"):
                name_elem = card.find("h5")
                aff_elem = card.find("p", class_="p-small")
                name = name_elem.get_text(strip=True) if name_elem else ""
                affiliation = aff_elem.get_text(strip=True) if aff_elem else ""
                authors.append({"name": name, "affiliation": affiliation})
            break
    return authors

def extract_details(soup):
    details = {}
    # Detailsブロック：white-block 内で、h4 に "Details" が含まれるブロックを対象
    for block in soup.find_all("white-block"):
        header = block.find("h4")
        if header and "Details" in header.get_text():
            # content-type を抽出
            type_elem = block.select_one("content-type-label span.type-name")
            details["content_type"] = type_elem.get_text(strip=True) if type_elem else None
            # duration を抽出
            duration_elem = block.select_one("duration-label")
            details["duration"] = duration_elem.get_text(strip=True) if duration_elem else None
            break
    return details

def extract_sessions(soup):
    sessions = []
    # セッション情報は、白ブロックのうちクラスが "schedule-details-block" のもの
    session_block = soup.select_one("white-block.schedule-details-block")
    if session_block:
        cards_container = session_block.select_one("div.cards-container")
        if cards_container:
            for card in cards_container.select("schedule-details-card"):
                session = {}
                # セッション名: schedule-info 内の h5.session-name-block > span.name
                name_elem = card.select_one("div.schedule-info h5.session-name-block span.name")
                session["session_name"] = name_elem.get_text(strip=True) if name_elem else None

                # セッションの日付: date-label 内の conference-date > span.mat-mdc-tooltip-trigger
                date_elem = card.select_one("date-label conference-date span.mat-mdc-tooltip-trigger")
                if not date_elem:
                    # 代替パス（場合によっては schedule-info 内に含まれる）
                    date_elem = card.select_one("div.schedule-info date-label span.mat-mdc-tooltip-trigger")
                if date_elem:
                    raw_text = date_elem.get_text(strip=True)
                    cleaned_text = re.sub(r'\s+', ' ', raw_text)
                    session["session_date"] = cleaned_text
                else:
                    session["session_date"] = None

                # セッション会場: location-container 内の a または span（リンク内テキスト）
                venue_elem = card.select_one("div.location-container a span.mat-mdc-tooltip-trigger")
                if not venue_elem:
                    venue_elem = card.select_one("div.location-container span.location")
                session["session_venue"] = venue_elem.get_text(strip=True) if venue_elem else None

                sessions.append(session)
    return sessions

def scrape_sigchi_content(content_id: int):
    url = f"https://programs.sigchi.org/chi/2025/program/content/{content_id}"
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    try:
        driver.get(url)
        wait = WebDriverWait(driver, 20)
        # タイトルが読み込まれるまで待機
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, TITLE_SELECTOR)))
        # 固定待機で非同期読み込みを待つ
        time.sleep(5)
        
        rendered_html = driver.page_source
        soup = BeautifulSoup(rendered_html, "html.parser")
        
        title = extract_title(soup)
        abstract = extract_abstract(soup)
        authors = extract_authors(soup)
        details = extract_details(soup)
        sessions = extract_sessions(soup)
        
        return {
            "id": content_id,
            "url": url,
            "title": title,
            "abstract": abstract,
            "authors": authors,
            "details": details,
            "sessions": sessions,
        }
    except Exception as e:
        print(f"Error scraping content {content_id}: {e}")
        return None
    finally:
        driver.quit()

if __name__ == "__main__":
    content_data = scrape_sigchi_content(188582)
    print(content_data)

