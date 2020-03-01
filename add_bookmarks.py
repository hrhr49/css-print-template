# -*- coding: utf-8 -*-
# 参考 
# https://stackoverflow.com/questions/18855907/adding-bookmarks-using-pypdf2
# https://stackoverflow.com/questions/50950825/pypdf2-why-am-i-getting-an-index-error-list-index-out-of-range
from PyPDF2 import PdfFileWriter, PdfFileReader
import json

def add_bookmark(bookmark_dict, pdf_writer, parent=None):
    title = bookmark_dict['title']
    page = bookmark_dict['page']
    children = bookmark_dict.get('children', [])
    current = pdf_writer.addBookmark(title, page, parent)
    for child in children:
        add_bookmark(child, pdf_writer, current)

if __name__ == '__main__':
    writer = PdfFileWriter()
    reader = PdfFileReader(open('output/output.pdf', 'rb'))
    if reader.isEncrypted:
        reader.decrypt('')

    for page in reader.pages:
        writer.addPage(page)

    parent = writer.addBookmark('Introduction', 0) # add parent bookmark
    writer.addBookmark('Hello, World', 0, parent) # add child bookmark

    bookmarks = json.load(open('bookmarks.json'))
    for bookmark in bookmarks:
        add_bookmark(bookmark, writer)
    writer.write(open('output/with_bookmark.pdf', 'wb'))
