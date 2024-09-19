AUTHOR = 'Federico Capoano'
SITENAME = 'OpenWISP'
SITEURL = ''
PATH = 'content'
TIMEZONE = 'Europe/Rome'
LOCALE = ('en_US.UTF-8',)
DEFAULT_LANG = 'en'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

MENU = {
    'Features': 'features/',
    'About': {
        'FAQ': 'faq/',
        'Source Code': 'code/',
        'History': 'history/',
        'Team': 'team/',
        'Partners': 'partners/',
        'Sponsorship': 'sponsorship/',
    },
    'Support': {
        'Community Support': 'support/',
        'Commercial Support': 'commercial-support/',
    },
    'Docs': 'https://openwisp.io/docs/preview/dev/',
    'Blog': 'blog/',
}

DEFAULT_PAGINATION = 1

# Uncomment following line if you want document-relative URLs when developing
RELATIVE_URLS = True

THEME = './theme/'

PAGE_URL = '{slug}/'
PAGE_SAVE_AS = '{slug}/index.html'
DRAFT_PAGE_URL = 'drafts/{slug}/'
DRAFT_PAGE_SAVE_AS = 'drafts/{slug}/index.html'
INDEX_SAVE_AS = 'blog/index.html'
ARTICLE_URL = 'blog/{slug}/'
ARTICLE_SAVE_AS = 'blog/{slug}/index.html'
DRAFT_URL = 'blog/drafts/{slug}/'
DRAFT_SAVE_AS = 'blog/drafts/{slug}/index.html'
AUTHOR_URL = 'blog/author/{slug}/'
AUTHOR_SAVE_AS = 'blog/author/{slug}/index.html'
AUTHORS_URL = 'blog/author/'
AUTHORS_SAVE_AS = 'blog/author/index.html'
CATEGORY_URL = 'blog/category/{slug}/'
CATEGORY_SAVE_AS = 'blog/category/{slug}/index.html'
CATEGORIES_URL = 'blog/category/'
CATEGORIES_SAVE_AS = 'blog/category/index.html'
TAG_URL = 'blog/tag/{slug}/'
TAG_SAVE_AS = 'blog/tag/{slug}/index.html'
TAGS_URL = 'blog/tag/'
TAGS_SAVE_AS = 'blog/tag/index.html'
ARCHIVES_URL = 'blog/archive/'
ARCHIVES_SAVE_AS = 'blog/archive/index.html'
ARTICLE_PATHS = ['blog']
DEFAULT_CATEGORY = 'main'

PAGINATION_PATTERNS = (
    (1, '{base_name}/', '{save_as}'),
    (2, '{base_name}/page/{number}/', '{base_name}/page/{number}/index.html'),
)

PLUGINS = [
    # allows creating Jinja macros that
    # can be used in content files (pages, blog posts)
    'pelican.plugins.jinja2content',
    # minify HTML
    # (JS and CSS are minified using nodeJS tools)
    'minify',
    # sitemap
    'sitemap',
]
JINJA2CONTENT_TEMPLATES = ['./includes']

CSS_MIN = False
JS_MIN = False
HTML_MIN = True
INLINE_CSS_MIN = False
INLINE_JS_MIN = False

SITEMAP = {
    'format': 'xml',
    'priorities': {
        'pages': 1.0,
        'articles': 0.6,
        'indexes': 0.3,
    },
    'changefreqs': {'articles': 'monthly', 'indexes': 'monthly', 'pages': 'monthly'},
    "exclude": ["404/", "blog/tag/", "blog/archive/"],
}

GOOGLE_ANALYTICS = None
