OpenWISP 2026 Midterm Report
============================

:date: 2026-07-16
:authors: Federico Capoano, Deepanshu Sahu, Eeshu Yadav, Mohammed Atif,
    Sarthak Tyagi, Pushpit Kamboj
:tags: gsoc, new-features
:category: gsoc
:lang: en
:image_url: https://openwisp.org/images/blog/gsoc26/midterm-report.webp
:image_width: 1920
:image_height: 1080

.. image:: {static}/images/blog/gsoc26/midterm-report.webp
    :alt: OpenWISP 2026 Midterm Report
    :align: center
    :target: /blog/openwisp-2026-midterm-report/

We are halfway through Google Summer of Code 2026 and the OpenWISP
projects are already taking shape.

This post gives a quick tour of what has landed so far, what is still
being reviewed, and what each project is going to make easier for OpenWISP
users in the next iterations.

Mass Commands
-------------

.. raw:: html

    <iframe width="560" height="315"
            style="width:100%; height:700px;"
            src="https://www.youtube.com/embed/_tTgIYIUqIo?vq=hd1080"
            title="OpenWISP Mass Commands demo"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
    </iframe>

Running the same command on many devices is still too manual in OpenWISP.
Today, an operator has to open each device page and trigger the command
one device at a time. That is fine for a handful of routers, but not for a
large network.

Mass Commands changes this by letting operators run a command on many
devices at once. They can target devices by organization, device group,
location, or by selecting devices manually.

**Command batches and API** (`PR #1395
<https://github.com/openwisp/openwisp-controller/pull/1395>`_): A new
``BatchCommand`` model keeps track of each batch, including its status,
label, notes and skipped devices. The new ``POST
/api/v1/controller/batch-command/execute/`` endpoint accepts the targeting
options, starts a background task, creates the individual ``Command``
objects and keeps the batch status updated. A ``GET`` dry-run endpoint
shows which devices would be affected before the command is actually run.

**Django admin view** (`PR #1420
<https://github.com/openwisp/openwisp-controller/pull/1420>`_): A custom
admin page shows the commands that belong to a batch, with pagination,
status colors and automatic refresh while a batch is still running. The
admin list now shows the batch label and the number of affected devices,
so operators can understand what happened without opening every command
one by one. Skipped devices are shown with the related error message.

For now, batches are started from the REST API. A dedicated admin page for
launching them from the browser is planned for the coming weeks.

Persistent & Scheduled Firmware Upgrades
----------------------------------------

.. raw:: html

    <iframe width="560" height="315"
            style="width:100%; height:700px;"
            src="https://www.youtube.com/embed/sQdoR9JEAi4?vq=hd1080"
            title="OpenWISP persistent firmware upgrades demo"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
    </iframe>

A mass firmware upgrade works best when all target devices are online. In
real networks, that is not always the case. Some devices may be rebooting,
temporarily disconnected, or sitting behind an unstable link. When that
happens today, the upgrade fails for those devices and someone has to
retry it later by hand.

Persistent Mass Upgrades (`issue #379
<https://github.com/openwisp/openwisp-firmware-upgrader/issues/379>`_)
fixes this. With persistence turned on, an unreachable device is not
treated as a final failure. Its upgrade stays ``pending`` and OpenWISP
keeps retrying in the background until the device comes back online, or
until an operator cancels it. The operator launches the rollout once and
OpenWISP takes care of the stragglers.

**Persistence and retries** (`PR #436
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/436>`_): Each
upgrade now records whether it is persistent, how many times it has been
retried and when the next attempt should happen. When a persistent upgrade
cannot reach a device, it goes back to ``pending`` instead of failing. A
background task picks it up later and waits a little longer after each
failed attempt, so unreachable devices are not hammered.

**Faster recovery with openwisp-monitoring** (`PR #436
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/436>`_): When
`openwisp-monitoring <https://github.com/openwisp/openwisp-monitoring>`_
is installed, OpenWISP can retry sooner. As soon as a device is reported
online again, its pending upgrade is started instead of waiting for the
next scheduled check.

**Admin, REST API and reminders** (`PR #436
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/436>`_):
Persistence is a checkbox when launching a mass upgrade. The upgrade page
shows whether retrying is enabled, how many attempts have already happened
and when the next attempt will run. Batch progress also shows pending
devices separately, so waiting devices are not confused with completed
ones. A pending upgrade can be cancelled from the admin or the REST API. A
small companion change in openwisp-notifications (`PR #490
<https://github.com/openwisp/openwisp-notifications/pull/490>`_) makes the
reminder link open the right filtered page.

This is the persistence half of the project. The next step is scheduled
mass upgrades, so operators can choose when a rollout should start. Since
it builds on the same retry work, scheduled upgrades will also keep
waiting for devices that are offline when the rollout begins.

Automatic Extraction of OpenWrt Firmware Image Metadata
-------------------------------------------------------

.. raw:: html

    <iframe width="560" height="315"
            style="width:100%; height:700px;"
            src="https://www.youtube.com/embed/9NwzAI6bypw?vq=hd1080"
            title="OpenWISP firmware metadata extraction demo"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
    </iframe>

OpenWISP needs to know which devices a firmware image can upgrade. Until
now, that depended on a hardcoded mapping between device models and image
types. Every new board had to be added by hand, so supporting new devices
was slower than it needed to be.

Automatic metadata extraction removes that manual step. When a firmware
image is uploaded, OpenWISP reads the useful details directly from the
image and stores them with the upload.

**Reading OpenWrt image metadata** (`PR #421
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/421>`_): A
new extractor reads the ``fwtool`` metadata found in many OpenWrt
sysupgrade images. If that metadata is missing, it can fall back to the
device tree data inside the image. Upload checks reject files that are
clearly not firmware images, such as JPEG, PNG or PDF files, and include
safety limits while reading compressed data.

**Storing and reviewing metadata** (`PR #437
<https://github.com/openwisp/openwisp-firmware-upgrader/pull/437>`_): The
``FirmwareImage`` model now stores the extracted board, target, compatible
devices, firmware version and source. Extraction runs in the background
after upload and the admin shows whether it is still running, succeeded or
failed. Once an image is confirmed, its metadata becomes read-only and
duplicate uploads are blocked. If OpenWISP cannot extract everything it
needs, the administrator gets a notification with a link to fill in the
missing fields manually.

Device pairing now uses the extracted board field instead of the old
hardcoded map. The next step is to use the ``compatible`` field, which
lists all boards supported by an image. That will make images that support
multiple boards match correctly. Existing firmware images will also be
processed automatically, so administrators do not have to update old
uploads by hand.

Add more timeseries database clients to OpenWISP Monitoring
-----------------------------------------------------------

.. raw:: html

    <iframe width="560" height="315"
            style="width:100%; height:700px;"
            src="https://www.youtube.com/embed/o7VB-4fIZuI?vq=hd1080"
            title="OpenWISP timeseries database clients demo"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
    </iframe>

OpenWISP Monitoring stores metrics and renders time series charts with
InfluxDB 1.8 today. The goal of this project is to add support for
InfluxDB 2.9 without forcing the rest of OpenWISP Monitoring to change how
it asks for data or builds charts.

That sounds simple, but InfluxDB 2 is different in several important ways:
it uses buckets, token-based authentication, a different Python client and
Flux queries instead of InfluxQL.

**InfluxDB2 backend** (`PR #801
<https://github.com/openwisp/openwisp-monitoring/pull/801>`_): A new
InfluxDB2 client handles connections, buckets, metric writes, reads,
deletes and queries. The existing charts now have Flux versions, so
uptime, packet loss, RTT, traffic, WiFi clients, CPU, memory and disk
charts can be rendered from InfluxDB2 data. The response parser also
converts InfluxDB2 results into the format that the rest of OpenWISP
Monitoring already expects.

The PR includes tests for configuration, writes, reads, deletes, generated
queries, charts and response parsing. Local setups can switch between the
two backends with ``TIMESERIES_BACKEND=influxdb`` or
``TIMESERIES_BACKEND=influxdb2``. Review feedback has already helped clean
up timezone handling, chart ranges and test isolation.

X.509 Certificate Generator Templates
-------------------------------------

.. raw:: html

    <iframe width="560" height="315"
            style="width:100%; height:700px;"
            src="https://www.youtube.com/embed/q3JS9hhrTdY?vq=hd1080"
            title="OpenWISP X.509 certificate generator templates demo"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
    </iframe>

Creating X.509 certificates one device at a time does not scale well.
Operators should be able to attach a certificate template to a device and
let OpenWISP generate the right certificate automatically.

Certificate Generator Templates add a new ``cert`` template type for that
workflow. When the template is assigned to a device, OpenWISP creates and
manages the certificate for it.

**Certificate templates** (`PR #1378
<https://github.com/openwisp/openwisp-controller/pull/1378>`_): A new
``cert`` type has been added to the Template model. It points to a
Certification Authority and a blueprint certificate. When the template is
assigned to a device, OpenWISP generates a certificate from that
blueprint. When the template is removed, the certificate is revoked but
kept in the database for auditability. Active certificate templates are
locked against changes that would make existing device certificates
inconsistent.

**Using certificates in configurations** (`PR #1378
<https://github.com/openwisp/openwisp-controller/pull/1378>`_): Operators
can reference generated certificates in device configuration with template
variables such as ``cert_<uuid>_path`` for the file path,
``cert_<uuid>_pem`` for the certificate and ``cert_<uuid>_key`` for the
private key. These values are filled in when OpenWISP previews or
generates the configuration.

**Certificate regeneration** (`PR #1378
<https://github.com/openwisp/openwisp-controller/pull/1378>`_): When a
device's name or MAC address changes, OpenWISP can revoke the old
certificate and issue a replacement automatically. Deployments that do not
want this behavior can disable it with the
``REGENERATE_CERTS_ON_HARDWARE_CHANGE`` setting.

**Custom certificate extensions** (`PR #228
<https://github.com/openwisp/django-x509/pull/228>`_): The django-x509
library now supports custom Object Identifiers (OIDs) in certificate
extensions. Generated device certificates can include the device MAC
address (``1.3.6.1.4.1.65901.1``) and UUID (``1.3.6.1.4.1.65901.2``),
which makes certificates easier to trace back to the device they belong
to.

In the coming weeks, we will polish this work and make the same
certificate template system usable by ``VpnClient`` too.
