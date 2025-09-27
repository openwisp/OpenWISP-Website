GSoC 2025: Improve UX and Flexibility of the Firmware Upgrader Module
=====================================================================

:date: 2025-09-23
:author: Roshan Kumar
:tags: gsoc, firmware-upgrader, new-features
:category: gsoc
:lang: en
:image_url: https://openwisp.org/images/blog/gsoc25/firmware-upgrader/gsoc25-firmware-upgrader.png
:image_width: 713
:image_height: 297

.. image:: {static}/images/blog/gsoc25/firmware-upgrader/gsoc25-firmware-upgrader.png
    :alt: Google Summer of Code, OpenWISP Firmware Upgrader Module
    :align: center

Over the past three months, I had the opportunity to work on my Google
Summer of Code project under the guidance of `Federico Capoano
(nemesifier) <https://github.com/nemesifier>`_, `Aryaman (Aryamanz29)
<https://github.com/Aryamanz29>`_, `Gagan Deep (pandafy)
<https://github.com/pandafy>`_ and `Oliver Kraitschy (okraits)
<https://github.com/okraits>`_. The journey was filled with challenges,
creative problem-solving, and exciting milestones that not only deepened
my technical knowledge but also strengthened my ability to collaborate and
adapt.

About the Project
-----------------

The firmware upgrader enhancements address key pain points network
administrators face:

- **Uncertainty about upgrade progress**: No real-time feedback.
- **Inability to stop problematic upgrades**: No cancellation controls.
- **Lack of granular control**: Upgrading entire networks vs. targeted
  subsets.

The enhanced system provides real-time feedback, safety controls, and
filtering capabilities that make managing firmware across large
deployments safer and more efficient.

Features Implemented
--------------------

Real-Time Firmware Upgrade Progress Tracking
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Single Device Upgrade Progress**

.. image:: {static}/images/blog/gsoc25/firmware-upgrader/single-device-progress-tracking.gif
    :alt: Real-Time upgrade progress tracking

**Mass Upgrade Progress**

.. image:: {static}/images/blog/gsoc25/firmware-upgrader/mass-upgrade-progress-tracking.gif
    :alt: Real-Time upgrade progress tracking

The firmware upgrade progress tracking feature provides real-time updates
on the progress of firmware upgrades. This feature is implemented using
WebSocket connections to deliver real-time progress updates directly to
the admin interface, eliminating the need for manual page refreshes.

Progress tracking is implemented at multiple levels, from individual
device operations to batch upgrade summaries, providing comprehensive
visibility into upgrade status.

**Use Cases**:

- Monitor real-time progress of long-running firmware upgrades without
  uncertainty
- Access upgrade logs without manual page refreshes

**Pull Requests:**

- `Show upgrade progress for single upgrade operations in real time
  <https://github.com/openwisp/openwisp-firmware-upgrader/pull/320>`_
- `Show upgrade progress for mass upgrade operations in real time
  <https://github.com/openwisp/openwisp-firmware-upgrader/pull/325>`_

Upgrade Operation Cancellation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: {static}/images/blog/gsoc25/firmware-upgrader/upgrade-operation-cancellation.gif
    :alt: Upgrade Operation Cancellation

Users can safely cancel firmware upgrade operations through a prominent
"Cancel" button that appears during in-progress upgrades, with built-in
safety mechanisms to prevent cancellation during critical phases.

The system automatically disables cancellation once an upgrade reaches 60%
completion, typically when firmware flashing begins. This prevents
dangerous interruptions that could brick devices.

When an upgrade is cancelled, the system automatically restarts any
services that were stopped during the upgrade process, ensuring devices
remain in a stable state.

**Use Cases**:

- Stop problematic upgrades that are taking too long or showing errors
- Cancel upgrades when emergency maintenance requires immediate device
  access

**Pull Requests:**

- `Allow cancelling firmware upgrade operations
  <https://github.com/openwisp/openwisp-firmware-upgrader/pull/329>`_

Mass Upgrade by Group and Location
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: {static}/images/blog/gsoc25/firmware-upgrader/mass-upgrade-by-group-and-location.gif
    :alt: Mass Upgrade by Group and Location

Mass upgrade operations now support precise device targeting through
device group and location filters, enabling administrators to upgrade
specific subsets of devices rather than entire networks.

Geographic or logical location filters enable site-specific upgrades,
allowing for gradual rollouts across different office locations,
buildings, or network segments.

Group and location filters can be used together to achieve very precise
targeting, such as "Access Points in Building A" or "Edge devices in the
European region".

**Use Cases**:

- Upgrade devices gradually by location (office by office, region by
  region)
- Update only specific device types (routers vs access points)
- Upgrade test environments or pilot groups before production rollout
- Quickly target security updates to specific vulnerable device groups

**Pull Requests:**

- `Allow mass upgrade by their group or location
  <https://github.com/openwisp/openwisp-firmware-upgrader/pull/343>`_

Current state
-------------

We are maintaining the `gsoc25
<https://github.com/openwisp/openwisp-firmware-upgrader/tree/gsoc25>`_
branch of `openwisp-firmware-upgrader
<https://github.com/openwisp/openwisp-firmware-upgrader>`_ module as
parent branch for all the firmware upgrade features. Once all the PRs are
merged and features are tested and validated, we can proceed with
releasing these along with OpenWISP 26.

Documentation Updates are tracked under the Pull Request `Updated
quick-start docs for gsoc25 features
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/347>`_.

My Experience
-------------

Working on `OpenWISP Firmware Upgrader
<https://github.com/openwisp/openwisp-firmware-upgrader>`_ during GSoC has
been an enriching experience that deepened my understanding of real-time
web applications, network device management, and large-scale system
design. The project challenged me to think about user experience from an
administrator's perspective - where clarity, safety, and control are
paramount.

I gained valuable experience with WebSocket programming, real-time data
synchronization, and building responsive user interfaces that handle
asynchronous operations gracefully. Working with Django Channels for
WebSocket support taught me about the complexities of managing persistent
connections and ensuring message delivery reliability.

The safety aspects of firmware upgrade cancellation required careful
consideration of device states and recovery mechanisms. This taught me
about the importance of building fail-safes into critical operations that
could potentially damage hardware if interrupted incorrectly.

Implementing the group and location filtering system provided insights
into building flexible query systems that remain performant even with
large device inventories. The dry-run capability development emphasized
the importance of user confirmation and preview features in administrative
interfaces.

Beyond the technical skills, I learned valuable lessons about testing
complex, stateful operations and ensuring that real-time features work
reliably across different network conditions and browser environments.

What's Next?
------------

The firmware upgrade enhancements provide a solid foundation for future
improvements to OpenWISP's device management capabilities.

I plan to continue contributing to OpenWISP, focusing on user experience
improvements and helping other contributors understand the firmware
upgrade system. The foundation built during GSoC provides many
opportunities for incremental improvements and new features that can
benefit network administrators managing diverse OpenWISP deployments.

The enhanced firmware upgrade experience represents a significant step
forward in making OpenWISP more user-friendly and suitable for large-scale
network management scenarios where clarity, control, and safety are
essential.
