GSoC 2025: Enhancing Uspot Captive Portal for OpenWrt
=====================================================

:date: 2025-08-27
:author: Thibaut Varène
:tags: gsoc, uspot, hotspot
:category: gsoc
:lang: en
:image_url: https://openwisp.org/images/blog/gsoc25/uspot-captive-portal-openwrt.png
:image_width: 713
:image_height: 295

.. image:: {static}/images/blog/gsoc25/uspot-captive-portal-openwrt.png
    :alt: Google Summer of Code, OpenWISP, Uspot Captive Portal (OpenWrt)
    :align: center

Project Goals Summary
---------------------

This GSoC project aims to improve **Uspot**, a relatively new captive
portal for OpenWrt, by implementing critical missing features that are
essential for large-scale deployments. **Uspot** is a promising
replacement for **CoovaChilli**, which is no longer actively developed and
only receives occasional maintenance patches. However, **Uspot** lacks
several important capabilities that **CoovaChilli** provides. This project
will focus on adding the most critical missing features to ensure
**Uspot** can be a viable alternative.

Project Achievements
--------------------

All technically feasible goals of the projects have been implemented,
merged upstream and incorporated into OpenWrt, with one caveat for goal #3
(*Support for RadSec*). In details:

Goal #1 *Traffic Reporting for RADIUS Accounting Interim-Updates* and Goal
#5 *Traffic Consumption Limits* were fully implemented in `#28
<https://github.com/f00b4r0/uspot/pull/28>`__ through the creation of an
ad-hoc `eBPF <https://ebpf.io>`__ module for high performance traffic
accounting.

For RADIUS reporting, the following Attributes are now supported:

::

    Acct-Input-Octets
    Acct-Input-Gigawords
    Acct-Input-Packets
    Acct-Output-Octets
    Acct-Output-Gigawords
    Acct-Output-Packets

For traffic limits, both static configuration and RADIUS-based
configuration are supported. The implemented RADIUS Attributes are:

::

    ChilliSpot-Max-Input-Octets
    ChilliSpot-Max-Input-Gigawords
    ChilliSpot-Max-Output-Octets
    ChilliSpot-Max-Output-Gigawords
    ChilliSpot-Max-Total-Octets
    ChilliSpot-Max-Total-Gigawords

Additionally, an extra configuration parameter ``swapio`` was added to
uspot configuration to enable swapping the Input and Output side of the
above RADIUS attributes.

Furthermore, the Captive Portal API support has been extended to provide
the ``bytes-remaining`` elements, per `RFC8908
<https://www.rfc-editor.org/rfc/rfc8908#name-api-state-structure>`__.

Goal #3 *Support for RadSec (RADIUS over TLS)* has been implemented for
**PSK**-based authentication in `#39
<https://github.com/f00b4r0/uspot/pull/39>`__, with the additional support
of **TCP**, **TLS** and **DTLS** RADIUS connection protocols (on top of
preexisting **UDP**).

Uspot configuration now supports ``auth_secret`` in the form of
``psk@username@hexkey`` for PreShared Key TLS authentication, provided
that the libradcli dependency is built with TLS support enabled (an
OpenWrt fix for this feature has been provided in `#26765
<https://github.com/openwrt/packages/pull/26765>`__).

Goal #4 *Bandwidth Limitation Features* was fully achieved by the addition
of static configuration support to uspot in `be50a66
<https://github.com/f00b4r0/uspot/commit/be50a66b777f518c4becd81bc81e21761af529eb>`__
on top of the preexisting support for RADIUS dynamic configuration.

Goal #2 was already fully supported and only needed some documentation
clarification, which was done as part of the massive **uspot** and
**ratelimit** [#]_ documentation update during this project. Goal #6 is
not technically implementable within uspot, dynamic VLAN assignment must
be done `in the wireless configuration
<https://openwrt.org/docs/guide-user/network/wifi/wireless.security.8021x#x_dynamic_vlans_on_an_openwrt_router>`__
instead.

.. [#] uspot companion software in charge of bandwidth limits:
    https://github.com/f00b4r0/ratelimit.

Current state
-------------

All the changes have been thoroughly tested via local and community-driven
feedback. In total, this project resulted in the following changesets:

- **in uspot**: 38 commits, 17 files changed, 781 insertions(+), 208
  deletions(-)
- **in ratelimit**: 10 commits, 5 files changed, 135 insertions(+), 20
  deletions(-)

All the changes have been merged upstream and pushed to the OpenWrt
packages feeds for releases **23.05** (`#27190
<https://github.com/openwrt/packages/pull/27190>`__), **24.10** (`13158a
<https://github.com/openwrt/packages/commit/e13158a304de860cb6ff6c586c67e0671aa7e9d6>`__)
as well as the **master** branch (`#27181
<https://github.com/openwrt/packages/pull/27181>`__) where they are now
available to all OpenWrt users.

TODO
----

Goal #3 *Support for RadSec (RADIUS over TLS)* could be further extended
by adding support for certificate-based authentication.

Takeaways
---------

The primary takeaway for me was the eBPF experience: getting acquainted
with the particulars of eBPF programming: the specific API, special
constraints on code and compiler checks, specific build recipes, etc; all
this was completely new to me and had a bit of a learning curve. This will
no doubt be useful for future projects.

Thanks
------

I'd like to thank the OpenWISP team, and in particular `Federico Capoano
<https://github.com/nemesifier>`_, for their sponsorship and help in
bringing this project to fruition through testing and constructive
feedback. It's been a pleasure working with them on this project and I
hope this will lead to more collaboration in the future!
