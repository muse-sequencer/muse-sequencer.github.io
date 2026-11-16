#!/bin/python
from bs4 import BeautifulSoup # html parser
import os
import json

# this script generates the search indexes for the search functionality, it gets the text contents from all .articlelink elements in a contents.html file

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.join(BASE_DIR, "../")

directories = [
        './', # english 
        'es/', # spanish
        ]

for unresolved_dir in directories:
    print("------------------- generating search index in " + unresolved_dir)

    directory = os.path.join(ROOT_DIR, unresolved_dir)
    indexedFiles = []

    if not os.path.exists(directory + 'contents.html'):
        print("contents.html not found in " + directory)
        exit(1)

    contentsFile = open(directory + 'contents.html', 'r')
    contentsHtml = contentsFile.read()
    contentsFile.close()

    contentsSoup = BeautifulSoup(contentsHtml, 'html.parser')

    for link in contentsSoup.select('.articlelink'):
        filename = str(link['href'])

        if filename.endswith(".html"):
            print("indexing: " + filename)

            f = open(directory + filename, 'r')
            html = f.read()
            f.close()

            soup = BeautifulSoup(html, 'html.parser')
            title = link.get_text() or "undefined title"
            url = filename
            content = "undefined content"

            mainDiv = soup.select_one('#main');

            if mainDiv is None:
                print("no main div, skipping " + filename)
                continue

            # default to the first h1 element to get the title of the page else fall back to first title element 

            content = mainDiv.get_text(separator=" ", strip=True)

            indexedFiles.append({
                'title': title,
                'url': url,
                'content': content
            })

    jsonFile = open(directory + 'search_index.json', 'w')
    json.dump(indexedFiles, jsonFile, indent = 2)
    jsonFile.close()

