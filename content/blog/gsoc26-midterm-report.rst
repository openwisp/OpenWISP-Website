OpenWISP 26 Midterm Report
==========================

:date: 2026-07-07
:authors: Federico Capoano, Deepanshu Sahu
:tags: gsoc, new-features
:category: gsoc
:lang: en
:image_url: https://openwisp.org/images/blog/gsoc26/openwisp-10-years-google-summer-of-code.webp
:image_width: 798
:image_height: 532

.. image:: {static}/images/blog/gsoc26/openwisp-10-years-google-summer-of-code.webp
    :alt: TODO this will be changed
    :align: center
    :target: /blog/openwisp-is-celebrating-10-years-of-google-summer-of-code/

Intro text here.

Mass Commands
-------------

Video.

In OpenWISP, running the same command on multiple devices currently
requires navigating to each device's page and triggering the command
individually. This repetitive process is time-consuming and inefficient
for large networks. Mass Commands solves this by letting operators run
commands across multiple devices simultaneously with flexible targeting by
organization, device group, location, or manual selection.

**Backend execution pipeline** (`PR #1395
<https://github.com/openwisp/openwisp-controller/pull/1395>`_): A new
``BatchCommand`` model tracks batches with fields for status, command type
and input, label, notes, and ``skipped_devices``. The ``POST
/api/v1/controller/batch-command/execute/`` endpoint accepts targeting
parameters and spawns a Celery task (``launch_batch_command``) that
resolves devices, creates individual ``Command`` records with an
idempotency guard, and aggregates status via
``calculate_and_update_status()``. A ``GET`` dry-run endpoint returns the
list of devices that would be affected without executing. The model also
computes ``total_devices``, ``successful``, and ``failed`` counts as
aggregated properties.

**Django admin interface** (`PR #1420
<https://github.com/openwisp/openwisp-controller/pull/1420>`_): A custom
admin change form displays an inline, paginated commands table with
colored status indicators and a real-time polling mechanism that refreshes
progress for in-progress batches. The changelist uses ``affected_devices``
(excluding skipped) as a computed column and replaces the ID with the
``label`` field as the clickable link for easier identification.
``Skipped_devices`` are merged into the commands table with error details,
and custom CSS provides consistent status styling.

Currently, execution is triggered via the REST API (``POST
/api/v1/controller/batch-command/execute/``). A dedicated admin view to
initiate batch commands from the admin panel will be added in the coming
weeks.

Persistent & Scheduled Firmware Upgrades
----------------------------------------

Video.

Summary of progress.

Automatic Extraction of OpenWrt Firmware Image Metadata
-------------------------------------------------------

Video.

Summary of progress.

Add more timeseries database clients to OpenWISP Monitoring
-----------------------------------------------------------

Video.

Summary of progress.

X.509 Certificate Generator Templates
-------------------------------------

Video.

Summary of progress.
