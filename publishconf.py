# This file is only used if you use `make publish` or
# explicitly specify it as your config file.

import os
import sys

sys.path.append(os.curdir)
from pelicanconf import *  # noqa

# If your site is available via HTTPS, make sure SITEURL begins with https://
SITEURL = 'https://openwisp.org'
RELATIVE_URLS = False

FEED_ALL_ATOM = 'feeds/all.atom.xml'
CATEGORY_FEED_ATOM = 'feeds/{slug}.atom.xml'
DELETE_OUTPUT_DIRECTORY = True
DEFAULT_PAGINATION = 10

# Following items are often useful when publishing
GOOGLE_ANALYTICS = 'G-BV5EEJD3CV'
