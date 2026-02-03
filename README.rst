OpenWISP-Website
================

The source code of the OpenWISP Website, all rights reserved.

Development
-----------

Install Node and Python dependencies required for QA checks:

::

    yarn install
    pip install -r requirements.txt

Now, run quality assurance checks with:

::

    ./run-qa-checks

Build:

::

    make html

    # if you are working only on content and
    # do not need to rebuild CSS/JS files:
    make html SKIP_YARN=1

Serve:

::

    make serve

To open a html file in the browser:

::

    google-chrome index.html

Credits
-------

- `Ura Design <https://ura.design>`_ (Conceptual Design)
- `Bulma CSS <https://bulma.io>`_ (Great CSS Framework)
- `Font Awesome <https://fontawesome.com>`_ (Great Icons)

Need help?
----------

Feel free to post any doubt or comment through our `support channels
<http://openwisp.org/support/>`_.
