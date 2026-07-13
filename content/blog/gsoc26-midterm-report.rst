OpenWISP 26 Midterm Report
==========================

:date: 2026-07-07
:authors: Federico Capoano, Deepanshu Sahu, Mohammed Atif, Sarthak Tyagi
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

OpenWISP Monitoring currently uses InfluxDB 1.8 for storing metrics and
rendering time series charts. This work adds InfluxDB 2.9 support while
keeping the existing monitoring APIs and chart behavior compatible with the
current backend. The main challenge is that InfluxDB2 is not a drop-in
replacement because it uses buckets instead of databases, token-based
authentication, a different Python client and Flux instead of InfluxQL.

**InfluxDB2 backend** (`PR #801
<https://github.com/openwisp/openwisp-monitoring/pull/801>`_): Added a new
InfluxDB2 client responsible for connection setup, bucket management,
metric writes, reads, deletes and query execution. Since InfluxDB2 uses
Flux instead of InfluxQL, the query layer now includes Flux templates for
the existing chart visualizations, while ``QueryResultSet`` normalizes
InfluxDB2 responses into the format expected by the rest of OpenWISP
Monitoring. This allows higher-level monitoring code to keep using the
same read and chart interfaces regardless of which time series backend is
configured.

The backend also handles InfluxDB2-specific details such as creating the
main and short-retention buckets, translating common read operations into
Flux filters and formatting chart queries with the correct bucket, fields,
aggregation and grouping windows. Existing visualizations such as uptime,
packet loss, RTT, traffic, WiFi clients, CPU, memory and disk charts now
have Flux equivalents so they can be rendered from InfluxDB2 data.

The PR adds backend-specific tests for configuration, writes, reads,
deletes, query generation, chart queries and result parsing. The test
runner and CI flow were updated to run InfluxDB1 and InfluxDB2 checks
against the correct backend, and local setup can switch between time series
databases with ``TIMESERIES_BACKEND=influxdb`` or
``TIMESERIES_BACKEND=influxdb2``. Review feedback has also led to fixes in
timezone handling, chart range queries and test isolation so both backends
remain consistent while still respecting their different query languages.

X.509 Certificate Generator Templates
-------------------------------------

Video.

In OpenWISP, provisioning X.509 certificates for each device has
traditionally been a manual process where operators had to create
certificates individually through the PKI module. This becomes impractical
at scale. Certificate Generator Templates solves this by introducing a new
``cert`` template type that automatically generates and manages X.509
certificates when assigned to devices, with support for blueprint-based
configuration, context injection, and automatic regeneration on hardware
changes.

**Template model and DeviceCertificate lifecycle** (`PR #1378
<https://github.com/openwisp/openwisp-controller/pull/1378>`_): A new
``cert`` type is added to the Template model with ``ca`` and
``blueprint_cert`` ForeignKeys referencing a Certification Authority and a
blueprint certificate. The ``DeviceCertificate`` through-model links
Config, Template and Cert with an idempotent lifecycle: when a cert
template is assigned to a device, a certificate is generated automatically
from the blueprint; when the template is removed, the certificate is
revoked but preserved in the database. Active templates are locked against
type, CA, and blueprint changes.

**Context configuration injection** (`PR #1378
<https://github.com/openwisp/openwisp-controller/pull/1378>`_): Operators
can reference generated certificates in device configuration using Jinja2
template variables such as ``{{ cert_<uuid>_path }}`` for the file path,
``{{ cert_<uuid>_pem }}`` for the PEM-encoded certificate, and ``{{
cert_<uuid>_key }}`` for the private key. These are resolved at
configuration preview and generation time.

**Certificate regeneration on hardware drift** (`PR #1378
<https://github.com/openwisp/openwisp-controller/pull/1378>`_): When a
device's name or MAC address changes, a Celery task automatically revokes
the existing certificate and issues a replacement. This can be disabled
per deployment via the ``REGENERATE_CERTS_ON_HARDWARE_CHANGE`` setting.

**Custom X.509 extensions with ASN.1 DER encoding** (`PR #228
<https://github.com/openwisp/django-x509/pull/228>`_): The django-x509
library adds support for custom Object Identifiers (OIDs) in certificate
extensions. An ASN.1 DER encoder validates and wraps values using the
``ASN1:<TYPE>:<KIND>:<VALUE>`` syntax. Reserved standard OIDs are
protected from overriding. Generated device certificates automatically
include custom extensions for the device MAC address
(``1.3.6.1.4.1.65901.1``) and UUID (``1.3.6.1.4.1.65901.2``).

In the coming weeks, we will focus on refining the implementation and
generalizing the certificate template system so it can be relied upon for
``VpnClient`` as well, ensuring a consistent certificate provisioning
experience across the entire device configuration pipeline.
