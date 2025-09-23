GSoC 2025: Better Map UX: Indoor, Mobile, Linkable URLs
=======================================================

:date: 2025-09-14
:author: Deepanshu Sahu
:tags: gsoc, netjsongraph.js, monitoring, new-feature
:category: gsoc
:lang: en
:image_url: https://openwisp.org/images/blog/gsoc25/map-improvements-indoor-mobile/gsoc-25-indoor-maps.png
:image_width: 782
:image_height: 765

.. image:: {static}/images/blog/gsoc25/map-improvements-indoor-mobile/gsoc-25-indoor-maps.png
    :alt: Google Summer of Code, Better Map UX: Indoor, Mobile, Linkable URLs
    :align: center

Participating in Google Summer of Code has been a transformative
experience. Over the past three months, I worked on my Google Summer of
Code project with OpenWISP, where I had the opportunity to enhance the
platform by improving its general map functionalities. With the constant
guidance, encouragement, and expertise of my mentors `Federico Capoano
(nemesifier) <https://github.com/nemesifier>`_ and `Gagan Deep (pandafy)
<https://github.com/pandafy>`_. I was able to explore new technologies,
tackle complex problems, and deliver features that significantly improve
usability, navigation, and accessibility in network visualization tools.
Their insightful feedback, patience, and supportive mentorship played a
crucial role in helping me grow as a developer and a contributor to
open-source projects.

About the Project
-----------------

.. raw:: html

    <iframe width="560" height="315"
            style="width:100%; height:700px;"
            src="https://www.youtube.com/embed/jFlQg64aZAk?si=DL1Ku7l5kfq4lact&vq=hd1080&autoplay=1"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
    </iframe>

The project aimed to enhance the OpenWISP general map with features that
improve accessibility, navigation, and monitoring for network
administrators. Key additions include indoor floor plan integration,
linkable map URLs, and real-time mobile device tracking. These
improvements help users manage complex networks more effectively and
troubleshoot issues with ease.

The experience presented significant technical challenges that deepened my
understanding of mapping libraries like `Leaflet.js
<https://github.com/Leaflet/Leaflet>`_ and `netjsongraph.js
<https://github.com/openwisp/netjsongraph.js>`_, while also offering
opportunities to collaborate with the open-source community and contribute
to a project with global impact.

Additionally, I contributed a fix for `Django Channels
<https://github.com/django/channels>`_ ``ChannelsLiveServerTestCase``
class, which had become incompatible with Django 5.2. I also added a
sample project with Selenium tests to ensure future compatibility, so that
any changes to Django internals that might break the test setup can be
caught early.

Building the General Map Enhancements
-------------------------------------

My contributions focused on making the map interface more intuitive and
interactive. I added features like device search, status-based filtering,
and seamless access to indoor maps from the general map view. Users can
now view specific devices within floor plans, switch between floors, and
open maps in fullscreen mode for better visualization. Additionally, users
can share URLs that link directly to specific nodes, graph states, or zoom
levels, making navigation and collaboration much easier.

.. image:: {static}/images/blog/gsoc25/map-improvements-indoor-mobile/before-after-ui-view.png
    :alt: Improved Dashboard Map UI before and after in OpenWISP

Features Implemented
--------------------

UI improvements on Location Pop-up
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: {static}/images/blog/gsoc25/map-improvements-indoor-mobile/improved-popup-ui-feature.gif
    :alt: Improved Dashboard Map UI Location Pop-up in OpenWISP

The location pop-up in the dashboard map has been enhanced to improve
usability and navigation. Users can now search for devices by name and
filter them by labels directly within the map interface through a popup
above the map. After filtering, users can quickly navigate to the detailed
page of the selected device. Additionally, devices associated with floor
plans include a button that opens the corresponding floor layout overlay
for better visualization.

To optimize performance, infinite scroll has been implemented in the
device list table to load data efficiently as users scroll. A debounce
mechanism is also applied to the search input, ensuring that unnecessary
queries are minimized and the interface remains responsive.

Indoor Map View
~~~~~~~~~~~~~~~

.. image:: {static}/images/blog/gsoc25/map-improvements-indoor-mobile/indoor-map-view.gif
    :alt: Indoor Map view in OpenWISP

If a device has an associated floor plan, a button is displayed that opens
the floor plan overlay, allowing users to switch between floors and toggle
fullscreen mode for a better visualization experience. Additionally, users
can click on a node in the indoor map to open a popup from which they can
navigate directly to the device’s detail page, making it easier to access
relevant information from within the map.

To optimize performance, separate instances of `netjsongraph.js
<https://github.com/openwisp/netjsongraph.js>`_ are used in dedicated
elements, enabling the map to be shown or hidden efficiently without
unnecessary reloads.

Shareable URLs
~~~~~~~~~~~~~~

.. image:: {static}/images/blog/gsoc25/map-improvements-indoor-mobile/shareable-urls.gif
    :alt: Shareable URLs Feature in OpenWISP

Support for shareable URLs has been added to the map interface. Whenever
users click on a node or link, the URL is dynamically updated with
parameters such as the graph ID, node ID, and zoom level to reflect the
current view. This allows users to bookmark or share direct links to
specific views within both geographic and indoor maps, simplifying
navigation and collaboration. The implementation is designed to be
standardized and extendable, enabling it to support multiple maps on a
single page when needed.

Real Time Device Location
~~~~~~~~~~~~~~~~~~~~~~~~~

The real-time mobile device tracking feature is still under development
and will be implemented in the future. It aims to provide dynamic updates
to device locations, ensuring that network administrators can monitor
moving devices in real time and respond to changes instantly.

Current state
-------------

We are maintaining the ``gsoc25-map`` branch as parent branch for all the
General map features. Once all the PRs are merged and features are tested
and validated, we can proceed with releasing these along with OpenWISP 26.

You can follow the development process and explore the implementation
details in the following pull requests:

- `ChannelsLiveServerTestCase fix for Django channels
  <https://github.com/django/channels/pull/2172>`_
- `Indoor Coordinates Endpoint
  <https://github.com/openwisp/openwisp-controller/pull/976>`_
- `Indoor Floor Plan Integration
  <https://github.com/openwisp/openwisp-monitoring/pull/688>`_
- `Linkable Map URLs in Monitoring
  <https://github.com/openwisp/openwisp-monitoring/pull/703>`_
- `Linkable Map URLs in Netjsongraph.js
  <https://github.com/openwisp/netjsongraph.js/pull/417>`_
- `Real-Time Mobile Device Tracking in monitoring
  <https://github.com/openwisp/openwisp-monitoring/pull/706>`_
- `Real-Time Mobile Device Tracking in netjsongraph.js
  <https://github.com/openwisp/netjsongraph.js/pull/444>`_

My Experience
-------------

My GSoC journey with OpenWISP has been a highly rewarding experience. With
the mentorship of `Federico Capoano (nemesifier)
<https://github.com/nemesifier>`_ and `Gagan Deep (pandafy)
<https://github.com/pandafy>`_, I was able to grow both technically and
personally. Their guidance, patience, and feedback helped me navigate
challenges while ensuring my contributions aligned with OpenWISP’s
architecture and community standards.

During the program, I focused on enhancing the map UI by implementing
features such as indoor map views, device search, and improved navigation.
This gave me the opportunity to deepen my understanding of front-end
optimization, API design, scalable components, and efficient data flow
management using tools like `netjsongraph.js
<https://github.com/openwisp/netjsongraph.js>`_.

Some of the toughest challenges I encountered included handling conflicts
between overlapping Coordinate Reference Systems (CRS) and designing the
bookmarkable URL feature. These challenges pushed me to explore libraries
like `Leaflet.js <https://github.com/Leaflet/Leaflet>`_ and
`netjsongraph.js <https://github.com/openwisp/netjsongraph.js>`_ more
thoroughly, broadening my knowledge of mapping tools and data handling
techniques.

Beyond coding, engaging with the OpenWISP community through discussions
and reviews was a valuable learning experience. The push we needed toward
the end of the program was especially helpful—it provided the motivation
and structure to stay focused, prioritize tasks, and deliver as much as
possible within the timeline. These final weeks taught me the importance
of discipline, time management, and perseverance when contributing to
open-source projects. I’m grateful for the support I received, which
strengthened my skills, confidence, and commitment to open-source
development.

What's Next?
------------

As my GSoC journey comes to an end, I am excited to continue contributing
to OpenWISP. In the near term, I will focus on refining the shareable URLs
feature to ensure that it performs reliably across different maps and user
interactions. I also plan to complete the real-time mobile device tracking
functionality by implementing efficient data handling and synchronization
methods.

Looking ahead, I hope to further improve the map UI, explore additional
optimizations, and expand the set of features that make network monitoring
easier and more intuitive. User feedback will be essential in identifying
areas that need enhancement, and I plan to actively engage with the
community to gather insights and iterate on solutions.

I am committed to maintaining and supporting the features I’ve developed,
addressing bugs, and helping other contributors onboard smoothly.
Open-source development has been a transformative experience for me, and I
look forward to being an active member of the OpenWISP community, learning
continuously, and contributing to projects that have real-world impact.
