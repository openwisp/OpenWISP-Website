GSoC 2026: Adding More Time-Series Database Backends to OpenWISP Monitoring
===========================================================================

:date: 2026-09-14
:author: Pushpit Kamboj
:tags: gsoc, monitoring, timeseries, influxdb, elasticsearch, new-features
:category: gsoc
:lang: en
:mermaid: true
:image_url: https://openwisp.org/images/blog/gsoc26/add-more-tsdb/add-more-tsdb-openwisp-monitoring.webp
:image_width: 1920
:image_height: 1080

.. image:: {static}/images/blog/gsoc26/add-more-tsdb/add-more-tsdb-openwisp-monitoring.webp
    :alt: Google Summer of Code, OpenWISP Monitoring Time-Series Database Backends
    :align: center
    :target: /blog/gsoc-2026-adding-more-time-series-database-backends-to-openwisp-monitoring/

Participating in Google Summer of Code had been a dream of mine since my
freshman year, and I am glad that I got to live that dream with
**OpenWISP**. Over the course of the program, I worked on improving the
flexibility of `OpenWISP Monitoring
<https://github.com/openwisp/openwisp-monitoring>`_ by adding support for
more time-series database backends.

With the guidance of my mentors `Federico Capoano (nemesifier)
<https://github.com/nemesifier>`_, `Gagan Deep (pandafy)
<https://github.com/pandafy>`_, and `Clément Beaujoin (cbeaujoin)
<https://github.com/cbeaujoin>`_, along with the OpenWISP community, I had
the opportunity to work on a core part of the monitoring system,
understand how OpenWISP stores and queries device metrics, and contribute
changes that make the project more adaptable for different deployment
needs.

About the Project
-----------------

`OpenWISP Monitoring <https://github.com/openwisp/openwisp-monitoring>`_
is the OpenWISP module responsible for collecting device metrics, running
monitoring checks, storing time-series data, rendering charts, and
generating alerts. Since monitoring data grows continuously over time, it
is stored in a time-series database rather than in the main relational
database.

.. raw:: html

    <style>
    pre.gsoc26-tsdb-diagram { text-align: center; }
    pre.gsoc26-tsdb-diagram svg { display: inline-block; max-width: 100%; height: auto; }
    </style>
    <pre class="mermaid gsoc26-tsdb-diagram">
    %%{init: {"theme": "base", "themeVariables": {
      "lineColor": "#8b949e", "textColor": "#1f2933", "nodeTextColor": "#1f2933",
      "edgeLabelBackground": "#f1f3f5"
    }, "flowchart": {"nodeSpacing": 50, "rankSpacing": 70}}}%%
    flowchart TB
        CORE["OpenWISP Monitoring core logic<br/>(metrics, checks, charts, alerts)"]
        ABC["BaseTimeseriesClient<br/>abstraction layer"]

        subgraph BACKENDS[" "]
            direction LR
            INFLUX1["InfluxDB 1.8 adapter"]
            INFLUX2["InfluxDB 2.9 adapter"]
            ES["Elasticsearch 9 adapter"]
        end

        CORE --> ABC
        ABC --> INFLUX1
        ABC --> INFLUX2
        ABC --> ES

        classDef core fill:#ed7800,stroke:#b35b00,color:#ffffff,font-weight:bold
        classDef interface fill:#fff1e0,stroke:#ed7800,color:#1f2933,font-weight:bold
        classDef legacy fill:#e2e3e5,stroke:#41464b,color:#1f2933
        classDef influx fill:#4396ec,stroke:#1d5fa7,color:#ffffff,font-weight:bold
        classDef elastic fill:#fbb111,stroke:#b36f00,color:#1f2933,font-weight:bold
        class CORE core
        class ABC interface
        class INFLUX1 legacy
        class INFLUX2 influx
        class ES elastic
    </pre>

The ``BaseTimeseriesClient`` abstract base class and type hints keep
monitoring logic independent of the underlying TSDB, so new backends can
be added without changing the core monitoring system.

Before this project, OpenWISP Monitoring primarily relied on `InfluxDB 1.8
<https://www.influxdata.com/>`_ for storing time-series data. While this
worked well, modern deployments may need more flexibility. Some users may
want to use newer versions of InfluxDB, while others may prefer
`Elasticsearch <https://www.elastic.co/elasticsearch/>`_ because it is
already part of their infrastructure or better suited to their operational
needs.

The objective of this project was to add more time-series database options
to OpenWISP Monitoring while keeping the codebase maintainable. The
original GSoC idea focused on completing the Elasticsearch support that
had unfortunately been abandoned six years ago, and on adding InfluxDB 2.9
as a new supported backend, so OpenWISP could support both InfluxDB 1.8
and newer alternatives without breaking existing behavior.

This required more than simply adding two new clients. The time-series
database layer had to become more extensible, chart queries had to work
across different query languages, retention policies had to be mapped to
different backend concepts, and the development and testing workflows had
to support multiple database backends reliably.

Project Goals
-------------

The main goals of this project were:

- Add support for **InfluxDB 2.9** as a new time-series backend.
- Complete and modernize support for **Elasticsearch** as a time-series
  backend.
- Refactor the time-series layer so different backends can be configured
  and maintained cleanly.
- Update the development setup, tests, `Docker <https://www.docker.com/>`_
  services, and documentation for the new backends.

Features Implemented
--------------------

InfluxDB 2.9 Support
~~~~~~~~~~~~~~~~~~~~

The first major feature implemented during this project was support for
**InfluxDB 2.9** as a time-series database backend for OpenWISP
Monitoring.

At the beginning, the task looked straightforward: add a new database
client, wire it into the existing settings, and make the monitoring code
write data to InfluxDB 2.9. However, once the implementation started, it
became clear that InfluxDB 2.9 is not just a drop-in replacement for the
older InfluxDB 1.8 backend. It felt like I had opened a Pandora's box.

InfluxDB 1.8 uses InfluxQL and retention policies, while InfluxDB 2.9 uses
Flux queries and buckets. This meant that the existing chart queries could
not simply be reused. The new backend needed its own query layer, while
still returning data in the shape expected by the existing OpenWISP
Monitoring charts, checks, and alert logic.

One of the most challenging parts was working with **Flux queries**.
Writing the first queries was manageable, but translating all the chart
behavior correctly took much more effort. The queries had to support
different chart types, summary views, grouped data, top fields, device
data, and custom chart configuration without changing the higher-level
monitoring code.

Another important challenge was handling **timezones** correctly. Charts
that use daily or weekly windows must align their buckets with the
timezone selected by the user, not always with UTC. This required careful
handling of Flux ``window`` and ``aggregateWindow`` queries so the chart
range and aggregation interval remained separate. Several review comments
helped catch these edge cases and improve the correctness of the final
implementation.

The backend also had to map OpenWISP's existing retention policy model to
InfluxDB 2.9 buckets. Since InfluxDB 2.9 does not support multiple
retention policies inside the same bucket in the same way as InfluxDB 1.8,
the implementation uses bucket naming conventions to preserve the behavior
expected by OpenWISP Monitoring.

During staging and review, a few additional issues surfaced around query
escaping, read/delete behavior, UDP writes through `Telegraf
<https://www.influxdata.com/time-series-platform/telegraf/>`_, test
stability, and compatibility with existing imports. These issues were
resolved iteratively with feedback from the maintainers, making the
backend more robust and closer to production-ready behavior.

The final implementation added:

- A new ``influxdb2`` backend implementing the shared time-series client
  interface.
- Flux-based chart, summary, device data, and retention support.
- HTTP writes, optional UDP writes through Telegraf, tests, and
  documentation for the new backend.

For the full technical discussion, implementation details, and maintainer
review comments, see `[feature] Added support for InfluxDB 2.x #801
<https://github.com/openwisp/openwisp-monitoring/pull/801>`_.

Elasticsearch 9 Support
~~~~~~~~~~~~~~~~~~~~~~~

The second major feature was adding **Elasticsearch 9** as another
time-series backend for OpenWISP Monitoring.

This part of the project needed more design work before writing the final
implementation. Elasticsearch is traditionally known as a search and
analytics engine, especially for keyword search and log data. In recent
versions, it also provides features for storing time-series data, but
there are different ways to model that data. We spent time deciding
whether OpenWISP should use Elasticsearch Time Series Data Streams (TSDS)
or regular data streams. TSDS looked attractive at first, but with
maintainer feedback we found it was too restrictive for OpenWISP's needs:
WiFi metrics include non-numeric values such as MAC addresses, device data
can contain JSON snapshots, and OpenWISP must support delayed writes from
devices that were offline for hours, days, or even longer. So we decided
to use regular Elasticsearch data streams by default.

After deciding the storage model, the implementation focused on making
Elasticsearch fit into the same time-series interface used by the InfluxDB
backends. The new backend stores metric points in data streams, creates
index templates and ILM lifecycle policies for retention handling, and
uses Elasticsearch Query DSL and aggregations to power OpenWISP's existing
charts without changing the higher-level monitoring code.

This involved implementing write, batch write, read, delete, device data,
retention policy, chart query, and summary query support. We also had to
handle Elasticsearch-specific details such as stable operation IDs for
`Celery <https://docs.celeryq.dev/>`_ retries, type-safe mappings for
values like MAC addresses, timestamp precision for deleting individual
points, exact distinct counts where OpenWISP needs them for health checks,
and safe cleanup of resources created by the backend.

The final implementation added:

- A new ``elasticsearch`` backend implementing the shared time-series
  client interface.
- Elasticsearch 9-compatible connection, authentication, and TLS
  configuration.
- Data streams, index templates, ILM retention, chart queries, reads,
  writes, deletes, tests, and documentation.

For the full technical discussion, implementation details, and maintainer
review comments, see `[feature] Add support for elasticsearch TSDB #829
<https://github.com/openwisp/openwisp-monitoring/pull/829>`_.

At runtime, device data moves through the monitoring API and Celery tasks
before reaching the common client interface. Each backend adapter handles
its own storage and query language, while the monitoring layer receives
the same output for charts, alerts, and API responses.

.. raw:: html

    <pre class="mermaid gsoc26-tsdb-diagram">
    %%{init: {"theme": "base", "themeVariables": {
      "lineColor": "#8b949e", "textColor": "#1f2933", "nodeTextColor": "#1f2933",
      "edgeLabelBackground": "#f1f3f5"
    }, "flowchart": {"subGraphTitleMargin": {"top": 16, "bottom": 16}, "nodeSpacing": 50, "rankSpacing": 70}}}%%
    flowchart TB
        subgraph COLLECTION["Metric collection"]
            ROUTER["OpenWrt router"] --> API["Monitoring API"]
        end

        subgraph MONITORING["OpenWISP Monitoring"]
            direction LR
            API --> CELERY["Celery tasks"]
            CELERY --> MODELS["Metric / Chart / DeviceData"]
            SETUP["Database and retention setup"] --> ABC["BaseTimeseriesClient"]
            MODELS --> ABC
        end

        subgraph BACKENDS[" "]
            direction LR
            ABC --> INFLUX1_ADAPTER["InfluxDB 1 adapter"] --> INFLUX1["InfluxDB 1.8"]
            ABC --> INFLUX2_ADAPTER["InfluxDB 2 adapter"] --> INFLUX2["InfluxDB 2.9"]
            ABC --> ES_ADAPTER["Elasticsearch adapter"] --> ES["Elasticsearch 9"]
        end

        INFLUX1 --> OUTPUT["Charts, alerts and API responses"]
        INFLUX2 --> OUTPUT
        ES --> OUTPUT

        classDef source fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,font-weight:bold
        classDef processing fill:#fff1e0,stroke:#ed7800,color:#1f2933,font-weight:bold
        classDef setup fill:#e2e3e5,stroke:#41464b,color:#1f2933
        classDef adapter fill:#f6f7f9,stroke:#8b949e,color:#1f2933
        classDef legacy fill:#e2e3e5,stroke:#41464b,color:#1f2933
        classDef influx fill:#4396ec,stroke:#1d5fa7,color:#ffffff,font-weight:bold
        classDef elastic fill:#fbb111,stroke:#b36f00,color:#1f2933,font-weight:bold
        classDef output fill:#ed7800,stroke:#b35b00,color:#ffffff,font-weight:bold
        class ROUTER source
        class API,CELERY,MODELS,ABC processing
        class SETUP setup
        class INFLUX1_ADAPTER,INFLUX2_ADAPTER,ES_ADAPTER adapter
        class INFLUX1 legacy
        class INFLUX2 influx
        class ES elastic
        class OUTPUT output
    </pre>

Both backend changes were later combined in the ``gsoc26-add-more-tsdb``
branch. The final `[feature] Added InfluxDB2 and Elasticsearch backend
support #868 <https://github.com/openwisp/openwisp-monitoring/pull/868>`_
proposes bringing the combined work to ``master``.

OpenWISP RADIUS Monitoring Integration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

While working on the new time-series backends, we found that one important
part of the OpenWISP ecosystem had not been calibrated in the original
GSoC timeline: the monitoring integration inside `OpenWISP RADIUS
<https://github.com/openwisp/openwisp-radius>`_.

OpenWISP RADIUS uses OpenWISP Monitoring to expose charts for RADIUS
accounting and user registration data. These charts were still defined
only with InfluxQL queries, which meant they worked with InfluxDB 1.8 but
not with the new InfluxDB 2.9 and Elasticsearch backends. If left
unchanged, users switching OpenWISP Monitoring to one of the new backends
would have working device monitoring charts, but broken RADIUS monitoring
charts.

To solve this, I updated the RADIUS monitoring integration with
backend-specific query definitions for the new time-series databases. The
work involved adding the required RADIUS chart and summary queries for
InfluxDB 2.9 and Elasticsearch, covering user registrations, total
registered users, RADIUS traffic, and unique RADIUS sessions in both
object-specific and general views.

Another important change was updating the
``rebuild_radius_accounting_metrics`` management command. It previously
deleted old metric data with a raw InfluxQL query, which tied it to
InfluxDB 1.8. The command now uses the shared
``timeseries_db.delete_metric_data()`` method, making the cleanup logic
work across the supported backends.

The final implementation added:

- Backend-specific RADIUS monitoring queries for InfluxDB 2.9 and
  Elasticsearch.
- Backend-neutral deletion in the RADIUS accounting rebuild command.
- Test, documentation, and CI updates for running RADIUS monitoring with
  multiple time-series backends.

For the full technical discussion and implementation details, see
`[feature] Updated monitoring integration to support new timeseries DBs
#772 <https://github.com/openwisp/openwisp-radius/pull/772>`_.

Deployment Support
~~~~~~~~~~~~~~~~~~

The final part of the feature work was making the new time-series backends
easier to deploy outside the development environment. In `docker-openwisp
<https://github.com/openwisp/docker-openwisp>`_, I added configurable
``TIMESERIES_BACKEND`` support, optional Docker Compose services for
InfluxDB 2.9 and Elasticsearch, Telegraf support for InfluxDB 2.9 UDP
writes, default environment variables, and tests for backend selection.

In `ansible-openwisp2 <https://github.com/openwisp/ansible-openwisp2>`_, I
updated the monitoring time-series configuration to be backend-agnostic,
documented examples for switching between InfluxDB 1.8, InfluxDB 2.9, and
Elasticsearch, and added `Molecule
<https://ansible.readthedocs.io/projects/molecule/>`_ verification for
rendered backend settings. The related work is tracked in `[feature] Added
configurable timeseries database backends #672
<https://github.com/openwisp/docker-openwisp/pull/672>`_ and `[feature]
Documented configurable monitoring TSDB backends #645
<https://github.com/openwisp/ansible-openwisp2/pull/645>`_.

My Experience
-------------

My GSoC journey with OpenWISP has been a highly rewarding experience. I
got the opportunity to work on a core part of OpenWISP Monitoring and
understand how device metrics flow through the system, how charts are
rendered, how alerts depend on time-series data, and how deployment tools
need to stay aligned with backend changes.

The journey itself was nothing short of a roller-coaster ride: from
opening my first pull request in mid-January, to spending weeks juggling
with GitHub Actions while working on the `[feature] Added changelog entry
bot using Gemini AI #584
<https://github.com/openwisp/openwisp-utils/pull/584>`_, to struggling
with setting up an `OpenWrt <https://openwrt.org/>`_ router through a
virtual machine. I still have not fully mastered that setup, so I shifted
my battleground to Docker and faced my fair share of Docker battles there.
Each step came with its own surprises, but each one also helped me
understand the OpenWISP ecosystem a little better.

The review process was one of the most valuable parts of the experience.
Feedback from the maintainers helped me catch issues I would not have
noticed on my own, especially around timezones, retention behavior,
distinct queries, retries, and compatibility with other OpenWISP modules.
It also taught me how important it is to keep changes maintainable, not
just working.

I eventually cleared the midterm evaluation, even though it happened two
weeks later than expected. As we all know, slow and steady wins the race!

What's Next?
------------

The next step is to get these changes ready for production use and move
them through the release process carefully. Since this work touches the
core monitoring storage layer, the focus is not only on merging the code,
but also on validating it across real deployment paths, including Docker,
`Ansible <https://www.ansible.com/>`_, RADIUS monitoring, and existing
InfluxDB 1.8 installations.

Once everything goes well, I would like to explore different areas within
OpenWISP, continue improving the monitoring stack, and contribute to other
parts of the ecosystem where I can be useful. I am looking forward to
seeing these changes used in real deployments and learning from the
feedback that comes after release.
