I18N Subsites plugin released
=============================

:date: 2014-02-05
:author: Ondřej Grover
:tags: test, releases
:category: news
:lang: en

Pelican has supported article and page translations `since version 2.6
<https://github.com/getpelican/pelican/blob/master/docs/changelog.rst#26-2011-03-08>`_.
However, this functionality does not include translations of themes or the
site name, something many have asked for. The new I18N Subsites plugin
makes it simple to:

- override settings for each language, e.g. ``SITENAME`` or ``MENUITEMS``
- translate and localize themes using ``jinja2.ext.i18n``
- automatically create translated subsites such as http://example.com/fr/

The new plugin is available in the `Pelican plugin repository
<https://github.com/getpelican/pelican-plugins/tree/master/i18n_subsites>`_.

A `demo site <http://smartass101.github.io/pelican-plugins/>`_ has been
put up to showcase the plugin. You can use the `demo site source
<https://github.com/smartass101/pelican-plugins/tree/gh-pages_source>`_ as
a reference for using the plugin in your own site. Although this plugin
has been tested, it is quite possible that you will find some bugs or
inconvenient behavior as it is very new. Do not hesitate to file an issue!

Finally, I would like to thank the Pelican developers for implementing and
designing Pelican so well that making this plugin was straightforward,
fast, and fun.
