GSoC 2025: WHOIS Info and Estimated Geographic Locations
========================================================

:date: 2025-09-01
:author: Aman Jagotra
:tags: gsoc, controller, whois, ip, new-features
:category: gsoc
:lang: en
:image_url: https://openwisp.org/images/blog/gsoc25-whois-and-ip-geolocation/gsoc25-whois-and-ip-geolocation.png
:image_width: 713
:image_height: 297

.. image:: {static}/images/blog/gsoc25-whois-and-ip-geolocation/gsoc25-whois-and-ip-geolocation.png
    :alt: Google Summer of Code, OpenWISP WHOIS Information and IP Geolocation
    :align: center

This summer has been one of the most rewarding experiences of my journey
as a developer. Over the past three months, I worked on my Google Summer
of Code project under the mentorship of `Federico Capoano (nemesifier)
<https://github.com/nemesifier>`_, `Sankalp (codesankalp)
<https://github.com/codesankalp>`_ and `Kapil Bansal (devkapilbansal)
<https://github.com/devkapilbansal>`_. The journey was filled with
challenges, creative problem-solving, and exciting breakthroughs that
significantly enhanced both my technical and collaborative skills.

About the Project
-----------------

.. image:: https://img.youtube.com/vi/tQTUJ5MKfTk/maxresdefault.jpg
    :alt: WHOIS Information and IP Geolocation Demonstration Video
    :target: https://youtu.be/tQTUJ5MKfTk

The WHOIS Information and IP Address-Based Geolocation Module enhances
OpenWISP by enriching device metadata with ownership details and
approximate geographic location whenever a new public IP address is
reported. This feature helps administrators improve network visibility,
identify anomalies, and streamline troubleshooting by providing context
about IP addresses directly within the OpenWISP platform.

For further details on these features and their functionality within
OpenWISP, see the documentation pages listed here:

- `WHOIS Lookup
  <https://openwisp.io/docs/stable/controller/user/whois.html>`_
- `Estimated Location
  <https://openwisp.io/docs/stable/controller/user/estimated-location.html>`_

Building WHOIS and IP Geolocation Functionality
-----------------------------------------------

My work involved tracking the IP addresses reported by devices and using
it to fetch WHOIS information which included details like organization
name, ASN, and location details. Using the location details obtained, a
location linked to the device must be created with clear indication of its
estimated nature.

Technical Approach
~~~~~~~~~~~~~~~~~~

To fetch WHOIS information, I used `geoip2 web service
<https://geoip2.readthedocs.io/en/latest/#sync-web-service-example>`_ to
obtain the necessary details. While **django** provides built-in support
for **geoip2**, at the time of writing this, it supports only database
based approach (which we will target in the future) and also has limited
fields available (see:
https://docs.djangoproject.com/en/5.2/ref/contrib/gis/geoip2/).

I also kept all the related code inside a single folder (``config/whois``
and ``geo/estimated-location``) to ensure flexibility, modularity and
maintainability while also following existing directory and coding
standards.

Features Implemented
--------------------

WHOIS Lookup
~~~~~~~~~~~~

.. image:: {static}/images/blog/gsoc25-whois-and-ip-geolocation/whois-details.webp
    :alt: WHOIS Details in OpenWISP

WHOIS is a widely used protocol that provides publicly available
registration details of IP addresses and domain names. It helps identify
the organization or individual that owns an IP address, along with related
information such as the organization name, ASN (Autonomous System Number),
CIDR block, etc. This data is crucial for network management, security
auditing, and diagnostics.

To perform a WHOIS lookup, the last reported IP address of a device is
tracked for changes. When a change is detected, the system performs all
the necessary checks and fetches asynchronously the WHOIS information
related to the new IP. Fetched details include organization name, ASN,
CIDR block, physical address, coordinates and timezone. Since the linking
of device and WHOIS record is via ip_address, data redundancy is
minimized.

Functional Highlights:

- **Global Configuration:** The feature can be configured globally as well
  as for individual organizations.
- **Asynchronous Lookup:** The lookup is done in background asynchronously
  to avoid blocking the main application flow.
- **Up-to-date WHOIS Information:** The system periodically refreshes
  WHOIS information to ensure it remains current and accurate.
- **Dedicated Admin Section:** WHOIS details are displayed alongside
  ``last_ip`` in the device admin page for easy access.
- **REST API:** WHOIS information is included in both device list and
  detail endpoints for API consumers.

**Related Work:**

- `WHOIS Data Retrieval and Storage #1054
  <https://github.com/openwisp/openwisp-controller/pull/1054>`_
- `Show WHOIS Details in the UI #1065
  <https://github.com/openwisp/openwisp-controller/pull/1065>`_
- `Updating stale WHOIS records #1116
  <https://github.com/openwisp/openwisp-controller/pull/1116>`_

Estimated Location
~~~~~~~~~~~~~~~~~~

.. image:: {static}/images/blog/gsoc25-whois-and-ip-geolocation/estimated-location.webp
    :alt: Estimated Location Feature in OpenWISP

IP-based geolocation estimates the physical location of a device using its
public IP address. This is achieved by querying reliable IP geolocation
databases that map IP ranges to real-world locations. The information
retrieved typically includes country, region, city, coordinates, and
sometimes the ISP. While not as precise as GPS, it is highly useful for
network monitoring, compliance, and detecting anomalies such as devices
connecting from unexpected regions.

Creation of estimated location for the device is done after performing
WHOIS lookup since location related information (coordinates and address)
is fetched as part of it.

Functional Highlights:

- **Global Configuration:** The feature can be configured globally as well
  as for individual organizations.
- **Asynchronous Management:** The creation/update of an estimated
  location is done in background asynchronously to avoid blocking the main
  application flow.
- **Clear Indicators and status update:** Estimated locations are flagged
  in the admin for manual review, and the status is cleared automatically
  when the address or geometry is updated.
- **User alerts:** Dispatch web notifications for modifications in
  estimated location.
- **REST API:** Estimated Status is included in all location related API
  endpoints like location list/detail, device locations etc. The field can
  also be used for filtering results.

**Related Work:**

- `Estimated Location Creation #1067
  <https://github.com/openwisp/openwisp-controller/pull/1067>`_
- `Estimated location: added notification and admin warning #1088
  <https://github.com/openwisp/openwisp-controller/pull/1088>`_
- `Estimated Location: Remove estimated status on manual update #1094
  <https://github.com/openwisp/openwisp-controller/pull/1094>`_
- `Estimated Location: Admin and API filters #1109
  <https://github.com/openwisp/openwisp-controller/pull/1109>`_

Current state
-------------

We are maintaining the ``gsoc25-whois`` branch as parent branch for all
the WHOIS and IP geolocation features. Once all the PRs are merged and
features are tested and validated, we can proceed with releasing these
along with OpenWISP 26.

All the WHOIS feature related PRs are merged to the ``gsoc25-whois``
branch except `Updating stale WHOIS records #1116
<https://github.com/openwisp/openwisp-controller/pull/1116>`_ which is
pending review.

The Estimated location feature related PRs `Estimated Location Creation
#1067 <https://github.com/openwisp/openwisp-controller/pull/1067>`_ and
`Estimated Location: Admin and API filters #1109
<https://github.com/openwisp/openwisp-controller/pull/1109>`_ are also
pending review.

My Experience
-------------

My GSoC journey with OpenWISP was an enriching experience that enhanced my
technical and collaborative skills. I worked closely with an amazing
community and mentors who provided constant guidance, insightful feedback,
and encouraged best practices throughout the program.

During this period, I gained hands-on experience with modern technologies
and development practices, including writing efficient, reusable code,
implementing automated tests, and improving software reliability through
iterative development. I also learned the importance of database
optimization, caching strategies, and integration testing, which deepened
my understanding of building scalable applications.

Beyond coding, I experienced the true essence of open-source
collaboration, engaging with the community, understanding real-world use
cases, and working in an environment where continuous feedback leads to
better solutions. This journey strengthened my ability to adapt,
troubleshoot, and deliver high-quality contributions.

What's Next?
------------

As my GSoC journey comes to an end, I’m looking forward to building on the
foundation we’ve created. There are several enhancements planned to make
these features even more powerful and user-friendly, such as:

- **Database-based WHOIS Lookup:** Adding support for MaxMind databases to
  improve lookup speed and reliability with mechanisms to keep them
  updated without manual effort.
- **SSID-based Geolocation:** Implementing a feature to determine the
  device's location based on nearby Wi-Fi SSIDs, leveraging external
  services (e.g. Google) for more accurate results.

Beyond these improvements, user feedback will play a key role in
identifying bugs, edge cases, and areas for refinement, helping us make
the features more robust over time.

I plan to keep contributing actively to OpenWISP, working on bug fixes,
adding new enhancements, and supporting new contributors in their
open-source journey. Now that I have an in-depth understanding of the
OpenWISP codebase, I’m also interested in maintaining and evolving the
features I developed during GSoC.
