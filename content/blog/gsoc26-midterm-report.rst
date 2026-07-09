OpenWISP 26 Midterm Report
==========================

:date: 2026-07-07
:authors: Federico Capoano, Mohammed Atif
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

Summary of progress.

Persistent & Scheduled Firmware Upgrades
----------------------------------------

Video.

Summary of progress.

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
