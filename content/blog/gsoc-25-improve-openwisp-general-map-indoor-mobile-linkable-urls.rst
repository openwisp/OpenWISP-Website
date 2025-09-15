GSoC 2025: Improve OpenWISP General Map: Indoor, Mobile, Linkable URLs
======================================================================

:date: 2025-09-14
:author: Deepanshu Sahu
:tags: gsoc, netjsongraph.js, monitoring, new-feature
:category: gsoc
:lang: en
:image_url: https://openwisp.org/images/blog/gsoc25/improve-openwisp-general-map-indoor-mobile-linkable-urls/gsoc-25-improve-openwisp-general-map-indoor-mobile-linkable-urls.png
:image_width: 713
:image_height: 297

.. image:: {static}/images/blog/gsoc25/improve-openwisp-general-map-indoor-mobile-linkable-urls/gsoc-25-improve-openwisp-general-map-indoor-mobile-linkable-urls.png
    :alt: Google Summer of Code, Improve OpenWISP General Map: Indoor, Mobile, Linkable URLs
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

The project focused on improving the OpenWISP general map by adding new
features such as indoor floor plan integration, and linkable map URLs and
real-time mobile device tracking. These enhancements are aimed at making
the platform more accessible and useful for network administrators,
helping them navigate complex networks, monitor devices, and troubleshoot
issues more efficiently.

While the journey presented deep technical challenges and learning
opportunities, it also allowed me to collaborate with a vibrant community
and contribute to an open-source project that impacts users globally.

Building the General Map Enhancements
-------------------------------------

My work revolved around improving the map UI to make it more usable by
enabling features such as searching for devices, adding filters based on
device status, opening indoor maps directly from the general map view, and
viewing a device’s location within an indoor map. Additionally, the
improvements support sharing URLs for specific views and implementing
real-time location updates for mobile devices to enhance monitoring and
navigation.

.. image:: {static}/images/blog/gsoc25/improve-openwisp-general-map-indoor-mobile-linkable-urls/before-after-ui-view.png
    :alt: Improve DashBoard Map UI in OpenWISP

Features Implemented
--------------------

Indoor Map View
~~~~~~~~~~~~~~~

.. image:: {static}/images/blog/gsoc25/improve-openwisp-general-map-indoor-mobile-linkable-urls/improved-general-map-view.gif
    :alt: Indoor Map view in OpenWISP

For the Indoor map view, I improved the UI of the dashboard map to make it
more user-friendly and efficient. The updated interface allows users to
search for devices by name and filter devices by their labels. If a device
has an associated floor plan, a button is displayed that opens the floor
plan overlay, allowing users to switch between floors and toggle
fullscreen mode for a better visualization experience. The data for the
indoor map is provided through a newly created API endpoint, which loads
the least positive floor by default and supports filtering based on the
selected floor. To optimize performance, I implemented separate instances
of netjsongraph in dedicated div elements, allowing the map to be shown or
hidden efficiently without unnecessary reloads.

Shareable URLs
~~~~~~~~~~~~~~

.. image:: {static}/images/blog/gsoc25/improve-openwisp-general-map-indoor-mobile-linkable-urls/share-url.gif
    :alt: Shareable URLs Feature in OpenWISP

I added a new feature in netjsongraph.js called urlFragments, which is
disabled by default and can be enabled when needed. With this feature,
every time a user clicks on a node or link in the map, the URL is updated
with parameters like graph ID, node ID, and zoom level. This makes it easy
to create shareable URLs that anyone can use to open the map directly to
the selected node or view. The logic is designed to be standardized and
extendable, so it can be applied across multiple maps, such as the
geographic and indoor maps. In the future, this could become a default
option, but for now, it’s available as an opt-in feature.

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

- `Indoor Floor Plan Integration
  <https://github.com/openwisp/openwisp-monitoring/pull/688>`_
- `Linkable Map URLs
  <https://github.com/openwisp/openwisp-monitoring/pull/703>`_
- `Real-Time Mobile Device Tracking
  <https://github.com/openwisp/openwisp-monitoring/issues/563>`_

My Experience
-------------

My GSoC journey with OpenWISP has been an incredibly rewarding experience.
Working under the mentorship of Federico Capoano and Gagan Deep, I had the
chance to grow both technically and personally. Their guidance, patience,
and insightful feedback helped me navigate the challenges of developing
complex features while staying aligned with OpenWISP’s architecture and
community standards.

Throughout the summer, I focused on improving the map UI by adding new
functionalities that enhance usability, navigation, and accessibility.
Implementing the indoor map view in particular allowed me to dive deep
into front-end optimization, API design, and user experience improvements.
I learned how to efficiently manage data flow, create scalable components,
and handle dynamic visualization using netjsongraph. The process of
creating API endpoints, refining interactions, and integrating feedback
helped me better understand best practices in software development.

Some of the toughest challenges I faced were managing conflicts between
overlapping Coordinate Reference Systems (CRS) and designing the
bookmarkable URL feature. These problems pushed me to explore and
understand the inner workings of libraries like Leaflet.js and
netjsongraph.js more deeply, expanding my knowledge of mapping tools and
data handling.

Although the shareable URLs feature has been implemented and works well,
refining its performance and ensuring smooth integration across multiple
views presented new learning opportunities. The real-time mobile device
tracking feature, while still under development, has further motivated me
to explore advanced data synchronization and event-driven architectures.

Beyond coding, I had the opportunity to engage with the OpenWISP
community, review code, collaborate on discussions, and contribute to
improving documentation and testing workflows. This experience has
strengthened my problem-solving skills, communication, and confidence in
contributing to open-source projects. I am grateful for the support I
received and the chance to grow as a developer.

The push we needed towards the end of the program to complete the project
was especially helpful. It gave me the motivation and structure to focus
my efforts, prioritize tasks, and deliver as much as possible within the
timeline. The final weeks taught me the importance of discipline, time
management, and perseverance when working on open-source projects.

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
