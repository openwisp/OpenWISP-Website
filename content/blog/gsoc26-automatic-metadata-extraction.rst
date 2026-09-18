GSoC 2026: Automatic Extraction of OpenWrt Firmware Image Metadata
==================================================================

:date: 2026-09-17
:author: Mohammed Atif
:tags: gsoc, openwisp-firmware-upgrader, new-features
:category: gsoc
:lang: en
:image_url: https://openwisp.org/images/blog/gsoc26/automatic-metadata-extraction.png
:image_width: 1920
:image_height: 1080

.. image:: {static}/images/blog/gsoc26/automatic-metadata-extraction.png
    :alt: Google Summer of Code, Automatic Metadata Extraction of OpenWrt Firmware Image Metadata in OpenWISP
    :align: center

Still feels unreal sometimes that I got to work with OpenWISP during
Google Summer of Code. These past 5 months have taught me a lot about how
many things go into a project of this scale, and how much a single review
comment can teach you. I am grateful to my mentors, `Federico Capoano
(nemesifier) <https://github.com/nemesifier>`_, `Alexandre Vincent
(asmodehn) <https://github.com/asmodehn>`_, and `Sankalp (codesankalp)
<https://github.com/codesankalp>`_, for their insightful feedback and,
most importantly, their patience in helping me through the learning curve
of understanding firmware images and OpenWrt's internals.

I had an amazing time working on the `OpenWISP Firmware Upgrader
<https://github.com/openwisp/openwisp-firmware-upgrader>`_ module, where I
implemented the automatic extraction pipeline for OpenWrt firmware image
metadata, which helped me understand firmware internals and how OpenWrt
images are structured far more deeply than I expected going in.

About the Project
-----------------

..
    TODO: embed the final demo video of the project
    .. raw:: html

        <iframe width="560" height="315"
                style="width:100%; height:700px;"
                src="https://www.youtube.com/embed/VIDEO_ID?vq=hd1080"
                title="OpenWISP Mass Commands demo"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
        </iframe>

Previously, when a firmware image was uploaded to
openwisp-firmware-upgrader, the admin had to manually enter important
metadata. This was obviously a tedious task in a lot of cases, and the
module also relied on a manually maintained lookup table, hardware.py,
mapping image filenames to a static list of compatible boards. This worked
while the number of supported OpenWrt targets was small, but it does not
scale: every new device or firmware naming convention meant a manual code
change, and the map could go stale as OpenWrt's own hardware support
evolved.

This project replaces that manual overhead with automatic metadata
extraction, reading the information directly from the firmware file itself
at upload time.

The Old Approach and Its Limits
-------------------------------

hardware.py worked as a static map, where each entry mapped an OpenWrt
image type string to the list of device boards it supported. When an admin
uploaded a firmware image, the module looked up its filename pattern in
this map as the sole source of truth for which devices it could pair with.

Some limits of this approach became clearer as the project progressed:

- Every new OpenWrt target or renamed image type required a manual pull
  request to update the map
- There was no way to verify the map was still accurate against the actual
  firmware files it described
- Custom, self-hosted deployments with their own device catalogs had to
  maintain their own separate mapping, duplicating the same maintenance
  burden
- The map only ever captured human-readable board names, with no path
  toward the more precise device-tree-based identifiers modern OpenWrt
  firmware actually embeds
- Pairing itself was opaque: if a filename didn't match any entry in the
  map, or a device's model wasn't listed against it, the image simply
  never paired with that device, with no status field or log explaining
  why, an admin had to already know the map's contents to debug it
- Since pairing was filename-pattern matching rather than anything read
  from the file, a correctly-working firmware image could fail to pair
  purely because it was renamed or didn't match the expected naming
  convention

These limits are what motivated moving metadata extraction to the firmware
file itself, covered next.

Features Implemented
--------------------

Automatic Metadata Extraction
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

..
    TODO: add screenshot once ready, e.g.
    .. image:: {static}/images/blog/gsoc26/firmware-upgrader-metadata/firmwareimage-admin-extracted.png
        :alt: FirmwareImage admin change form showing board, compatible and target populated after extraction

Most OpenWrt sysupgrade images are built with fwtool, which appends a
small trailer of JSON metadata to the end of the image file: the board
identifier, the target, the firmware version, and the list of devices the
image supports. Extraction looks for this trailer first, since it's the
most direct and reliable source when it's present, no guessing or
pattern-matching required, the image describes itself.

..
    TODO: add screenshot once ready, e.g.
    .. image:: {static}/images/blog/gsoc26/firmware-upgrader-metadata/extraction-log-dtb-fallback.png
        :alt: Extraction log showing a DTB fallback after the fwtool trailer was missing or unusable

Not every image carries an fwtool trailer, and some are compressed in ways
that make locating it unreliable. For these cases, extraction falls back
to scanning the image for an embedded DTB, the same structure the Linux
kernel uses at boot to describe the hardware it's running on. A DTB
carries model and compatible properties that identify the board just as
directly, just from a different part of the image.

New Model Fields
~~~~~~~~~~~~~~~~

..
    TODO: add screenshot once ready, e.g.
    .. image:: {static}/images/blog/gsoc26/firmware-upgrader-metadata/extraction-status-badge.png
        :alt: extraction_status badges shown in the FirmwareImage changelist

Several new fields on FirmwareImage carry the result of extraction:

- board, the identifier used to pair the image with a device, replacing
  the old hardware-map lookup
- compatible, the fuller list of DTB-style identifiers an image supports
- target, the OpenWrt target platform the image was built for
- fw_version, the firmware version extracted from the image, shown
  whenever it differs from the build's own version
- source, recording which method produced the metadata, fwtool, dtb, or
  manual, so an admin can tell at a glance how much to trust a given value
- extraction_status, recording whether extraction succeeded outright, fell
  back to the DTB scan, came back incomplete, or failed, backed by a
  failure_reason for the failed case and a full extraction_log for the
  details

extraction_status doubles as an observability layer. Rather than an image
silently failing to pair with any device and leaving the admin to guess
why, the status, reason, and log make the cause visible directly in the
admin interface.

Safety Guards in the Extraction Pipeline
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

..
    TODO: add screenshot once ready, e.g.
    .. image:: {static}/images/blog/gsoc26/firmware-upgrader-metadata/extraction-failed-incomplete.png
        :alt: Extraction log showing a failed status with the reason, e.g. decompression limit exceeded

Firmware uploads are untrusted binary input, so the extraction pipeline
enforces limits at every stage: caps on raw file size, decompressed size,
and compression ratio guard against decompression-bomb-style uploads, and
a separate cap on the fwtool trailer's claimed metadata size prevents an
oversized JSON payload from being parsed even after it passes checksum
validation. Any image that trips these limits is marked as failed with a
clear reason, and the admin can inspect the extraction log if needed.

Recovering from Extraction Failures
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Extraction runs in the background via Celery, and the background workers
can fail in ways ordinary exception handling can't catch, a worker killed
by an out-of-memory condition, or one that hits Celery's hard time limit
mid-extraction, both leave affected images stuck in progress indefinitely,
with nothing coming back to retry it.

Two tasks handle recovery: reclaim_stale_extractions finds images stuck in
progress past a configurable timeout and marks them failed so they can be
manually re-extracted or corrected, and queue_unconfirmed_extractions
picks up any image still sitting unconfirmed and queues it for extraction.
The second one also runs automatically every time a worker starts, so
images left unconfirmed after a deploy or a crash get requeued without
anyone noticing, guarded by a short-lived cache lock so multiple workers
restarting together don't all queue the same backlog at once.

Both tasks are idempotent and safe to run concurrently with themselves, so
the recommended setup schedules them periodically via Celery Beat, a
missing schedule is flagged directly by a Django system check, the same
one you'd see in your deployment logs if you forget to wire it up.

This isn't just cleanup: a build's mass upgrade is blocked entirely if
even one of its images is still unconfirmed, in progress, failed, or
invalid, so a single stuck extraction can hold up an entire rollout until
it's recovered.

Admin Workflow: Manual Confirmation and Bulk Re-extraction
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When an extraction fails or comes back incomplete, an admin can fill in
board and the other metadata fields by hand directly in the change form.
Saving those changes automatically confirms the image, extraction status
moves to 'Manually Confirmed' and the build's own status updates to
reflect it, without a separate confirm step.

A bulk **Re-extract metadata** action is also available for images where
the underlying file changed or extraction needs to be retried. It skips,
and reports skipping, several categories of images so it can never undo a
working state:

- images with an upgrade operation currently in progress
- images already locked (success or manually confirmed)
- images marked incomplete, since re-extraction wouldn't recover what's
  missing, they need manual input instead
- images already assigned to a device

Device Pairing via board
~~~~~~~~~~~~~~~~~~~~~~~~

..
    TODO: add screenshot once ready, e.g.
    .. image:: {static}/images/blog/gsoc26/firmware-upgrader-metadata/device-firmware-image-dropdown.png
        :alt: Device firmware image dropdown showing only images eligible for pairing

An image only becomes eligible for pairing once its extraction_status
reaches success, manually confirmed or incomplete, images still
unconfirmed, mid-extraction, or failed are excluded, so a device can never
be paired to metadata that hasn't been verified. Pairing itself is an
exact match: ``device.model == image.board``. Once an image reaches
success or manually confirmed, its metadata fields are locked and can no
longer be edited, protecting a working pairing from being silently
invalidated.

REST API Support
~~~~~~~~~~~~~~~~

Extraction fields are read-only through the API in the same way they are
in the admin: supplying board, compatible, or extraction_status on
creation is silently ignored, since they can only come from real
extraction. Manual confirmation works the same way as in the admin too,
PATCH-ing the metadata fields of a failed or incomplete image confirms it
automatically, so the same workflow is available to automation scripts and
integrations, not just the browser.

Migrating Away from the Static Hardware Map
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A migration backfills board on every pre-existing firmware image that was
uploaded before the new extraction pipeline was in place. This is done by
using the old hardware map, so upgrading doesn't leave existing images
unpaired. Most images resolve to a single board automatically, but a small
number of legacy images matched more than one board in the old map, since
one file could serve several hardware variants, and for those the
migration can't guess which one a given deployment actually has: they're
marked Incomplete with a log entry listing every compatible board, so an
admin can set the correct one manually.

Current State
-------------

The work is split across two pull requests merged into the
`gsoc26-metadata-extraction
<https://github.com/openwisp/openwisp-firmware-upgrader/tree/gsoc26-metadata-extraction>`_
feature branch of `openwisp-firmware-upgrader
<https://github.com/openwisp/openwisp-firmware-upgrader>`_: `#421
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/421>`_, which
laid the extractor pipeline and the safety limits, has already been
merged. `#437
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/437>`_, which
adds the model fields, the migration, and the admin and REST API workflow
described above, is still open and under review. Once it lands, the
feature branch will be proposed for merging into **master** in a follow-up
pull request.

My Experience
-------------

There are many things I'm taking away from this project, and the
experience was great, even with hours of being completely stuck. Three
lessons stood out: ask your mentors questions earlier instead of getting
stuck alone, always think from the user's perspective before writing UI/UX
code, and lastly, always consider the long-term impact of your changes,
not just the immediate benefits.

My mentors' feedback also taught me how to write modular, reusable, and
maintainable code. The hardest parts were handling edge cases and
potential attack vectors in the extraction pipeline, and writing
migrations that wouldn't break existing deployments. Both pushed me to
deep dive into how OpenWrt firmware images are structured and how they can
be manipulated.

The part I didn't expect to enjoy as much as I did was writing the OpenWrt
metadata extractor itself. Working directly with raw bytes, struct
unpacking, and decompression formats gave me a level of low-level
understanding I never got from typical web development, and it changed how
I think about untrusted input even outside this project.

What's Next?
------------

The next step is to get these changes ready for production use, beyond
that, the natural continuation is compatible-based device pairing: adding
a ``board_name`` field to devices so multi-board images can pair
automatically instead of always requiring manual confirmation. This is
tracked across three repositories, in `openwisp-controller issue #1491
<https://github.com/openwisp/openwisp-controller/issues/1491>`_ for the
new device field, `openwisp-config issue #282
<https://github.com/openwisp/openwisp-config/issues/282>`_ for sending it
from the device, and `openwisp-firmware-upgrader issue #493
<https://github.com/openwisp/openwisp-firmware-upgrader/issues/493>`_ for
the pairing logic itself.

I plan to keep contributing to this module and keep improving what we have
worked towards till this point, and also explore other parts of OpenWISP
while supporting new contributors whenever I can.
