OpenWISP 26 Midterm Report
==========================

:date: 2026-07-07
:authors: Federico Capoano, Deepanshu Sahu, Mohammed Atif, Eeshu Yadav
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

A mass firmware upgrade only works cleanly when the target devices are
online. Today, if a device is offline when the upgrade runs, the
operation fails straight away and the device is left behind: someone has
to notice it later and start the upgrade again by hand. On a large
network, where a few devices are almost always down for a reboot or a
flaky link, this means a rollout rarely reaches everything in one go.

Persistent Mass Upgrades (`issue #379
<https://github.com/openwisp/openwisp-firmware-upgrader/issues/379>`_)
fixes this. With persistence turned on, an upgrade that cannot reach a
device is no longer counted as a failure; it is kept in a new ``pending``
state and quietly retried in the background until the device comes back
online, or until an operator cancels it. The operator launches the
rollout once and OpenWISP takes care of the stragglers on its own.

**Persistence and the retry loop** (`PR #436
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/436>`_):
Every upgrade now remembers whether it is persistent, how many times it
has been retried and when the next attempt is due. When a persistent
upgrade runs out of its immediate connection attempts it goes back to
``pending`` instead of failing, and schedules the next try for later,
waiting a little longer after each attempt so an unreachable device is
not hammered. A background task regularly picks up the upgrades that are
due and starts them again, with a guard that makes sure the same upgrade
can never run twice even if two things trigger it at the same time.

**Faster recovery with openwisp-monitoring** (`PR #436
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/436>`_): When
`openwisp-monitoring <https://github.com/openwisp/openwisp-monitoring>`_
is installed, OpenWISP does not have to wait for the next scheduled check.
The moment a device is reported back online its pending upgrade is woken
up right away, so a device is updated as soon as it returns rather than on
the next scan.

**Admin, REST API and reminders** (`PR #436
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/436>`_):
Persistence is a simple checkbox when you launch a mass upgrade, and it
applies to every device in the batch. Each operation shows its retry
state — persistent or not, how many times it has retried and when it will
try next — right above the log, and the batch counts progress as "N
complete, M pending" so devices that are still waiting are not mistaken
for finished ones. A pending upgrade can be cancelled at any time from the
admin or the REST API, and OpenWISP keeps reminding administrators about
the devices still waiting, linking them straight to the pending list.
Making that reminder open the right page from the notifications panel
needed a small companion change in openwisp-notifications (`PR #490
<https://github.com/openwisp/openwisp-notifications/pull/490>`_).

This is the persistence half of the project. The next few weeks move on
to scheduled mass upgrades, which will let operators pick a date and time
for a rollout; since it reuses the same machinery, a scheduled upgrade
will be persistent too and keep retrying whatever devices are offline
when it runs.

Automatic Extraction of OpenWrt Firmware Image Metadata
-------------------------------------------------------

Video.

In OpenWISP, matching a firmware image to the devices it can upgrade
relied on a hardcoded mapping (``hardware.py``) between device models and
image types. Every new board had to be added to this file by hand, which
meant adding support for new devices was slow and required a code change
every time. Automatic metadata extraction removes this static map by
reading the information directly from the firmware image at upload time.

**Extraction foundation and OpenWrt pipeline** (`PR #421
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/421>`_): A
``BaseMetadataExtractor`` abstract base class defines a two-path
extraction lifecycle so support for other embedded operating systems can
be added later. The ``OpenWrtMetadataExtractor`` reads the ``fwtool``
metadata trailer appended to sysupgrade images as a fast path, and falls
back to scanning the image's device tree blob (DTB) for images that have
no trailer (e.g. sunxi, ipq40xx initramfs). Extraction is guarded against
decompression bombs through chunked reading with ratio and size limits,
and files that are clearly not firmware images (such as JPEG, PNG or PDF)
are rejected on upload.

**Metadata fields, state machine and async task** (`PR #437
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/437>`_): The
``FirmwareImage`` model gains the extracted fields (board, target,
compatible, firmware version, source) and an extraction status that moves
an image from ``Unconfirmed`` to ``In Progress`` and finally to
``Success`` or ``Failed`` as a Celery task processes it after upload. Once
an image is confirmed, its metadata becomes read-only and a
``unique_together`` constraint prevents duplicate uploads. When extraction
cannot fully populate the metadata, a notification links the administrator
to a manual input page where the missing fields can be filled in by hand.
Device pairing is migrated off the hardcoded image type map and now uses
the extracted board field instead.

Currently, device pairing matches an image's board field against the
device model, which only works when the device matches the image's primary
board. In the coming weeks, pairing will move to the ``compatible`` field,
which lists every board an image supports, so images that cover multiple
boards pair correctly. A data migration will also run extraction
automatically for images that predate the feature, so administrators do
not have to trigger it manually.

Add more timeseries database clients to OpenWISP Monitoring
-----------------------------------------------------------

Video.

Summary of progress.

X.509 Certificate Generator Templates
-------------------------------------

Video.

Summary of progress.
