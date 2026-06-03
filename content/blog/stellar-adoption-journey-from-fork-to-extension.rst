Stellar's OpenWISP Adoption Journey: From Fork to Extension
===========================================================

:date: 2026-06-02
:author: Alexandre Vincent
:tags: openwisp, networking, open-source, devops
:category: Community
:lang: en
:mermaid: true
:image_url: https://openwisp.org/images/blog/steer-management.webp
:image_width: 1200
:image_height: 400

.. image:: {static}/images/blog/steer-management.webp
    :alt: Stellar's OpenWISP extension: STEER-MANAGEMENT
    :align: center
    :target: /blog/stellars-openwisp-adoption-journey-from-fork-to-extension/

At `Stellar Telecommunications <https://stellar.tc>`_, we bring resilient
connectivity across networks to mobility, enterprise, and governments,
leveraging the combined strength of all terrestrial and satellite
networks. We offer software, data plans, and all-inclusive options for
unbreakable and sovereign connectivity needs.

As we've scaled, we've relied on open-source tools, particularly OpenWISP,
to manage our growing fleet of GLOBBLE routers. For the past two years,
we've leveraged `OpenWISP <https://openwisp.org/>`_ to remotely manage our
dual-cellular + WAN connections at scale. Our team working on OpenWISP
(and related topics) consists of one to two senior developers (depending
on availability and business constraints), with backgrounds in software
development, networking, and system administration.

The Map
-------

We began our journey with an Ansible-based deployment of the original
OpenWISP. From the outset, we did not utilize the Wi-Fi-related modules,
as they were not relevant to our use case. It can be argued that our goals
differ slightly from OpenWISP's original aim (managing Wi-Fi hotspots).
However, most of the required features are similar enough that
collaboration remains beneficial.

.. raw:: html

    <pre class="mermaid">
    graph TD
    OpenWISP_Users
    OpenWISP_Notifications
    OpenWISP_Controller
    OpenWISP_Monitoring
    OpenWISP_FirmwareUpgrader
    </pre>

After a couple of years using a limited subset of OpenWISP features, we
reached several limitations:

- No support for custom configuration of our proprietary routers (based on
  `OpenWrt <https://openwrt.org/>`_ but extended with additional features)
- Limited adaptability to our operational workflows and evolving practices
- Difficulty introducing improvements that might not align immediately
  with the upstream roadmap
- Increasing demand from customers for a dedicated management solution for
  their deployed routers

To address these challenges, we initially forked the repository and
maintained our own modifications. While this worked temporarily, it became
unsustainable due to divergence and merge conflicts.

Recognizing that OpenWISP is designed to be extensible, we transitioned to
a more robust approach: building an extended version of OpenWISP to host
our customizations, including features, regression tests, and development
tooling.

We followed the official documentation to extend OpenWISP modules. When
documentation gaps arose, the automated test suites proved to be a
reliable reference.

.. raw:: html

    <pre class="mermaid">
    graph TD
    OpenWISP_Users -- extended --> STEER_Users
    OpenWISP_Notifications -- extended --> STEER_Notifications
    OpenWISP_Controller -- extended --> STEER_Controller
    OpenWISP_Monitoring -- extended --> STEER_Monitoring
    OpenWISP_FirmwareUpgrader -- extended --> STEER_FirmwareUpgrader
    </pre>

For the full technical details, see the next section: *The Territory*.

Our primary achievement has been the successful transition from an ad-hoc
fork to a fully extended architecture. This allows us to develop custom
features for our routers while identifying, fixing, and contributing
upstream improvements in a much shorter time frame.

The Territory
-------------

Our technical approach was guided by the following constraints:

- Preserve all existing data
- Keep database migrations simple and safe
- Maintain our technology stack: OpenWISP 24.11, Django 4.2, Python 3.11,
  Debian 12
- Enable thorough testing and facilitate upstream contributions

We have since upgraded to Django 5.2 and Python 3.13 on Debian 13.

Our Python development environment for each module is intentionally
simpler than OpenWISP's:

- Initially based on ``direnv`` and ``asdf`` for environment management;
  recently migrated to ``mise``
- Use of ``pip-tools`` to pin exact dependency versions per Python and
  codebase version
- A long-term goal to run tests from any OpenWISP dependency module across
  repositories

This last goal is not fully achieved yet due to technical constraints, but
remains a priority, as it would ensure consistency regardless of Django
project configuration.

Code and Module Extension
~~~~~~~~~~~~~~~~~~~~~~~~~

During this process, we found that inheritance works well for extending
Python code.

.. raw:: html

    <pre class="mermaid">
    classDiagram
    class OpenWISP_App
    class STEER_App
    class OpenWISP_App_TestCase
    class STEER_App_TestCase
    OpenWISP_App <|-- STEER_App
    OpenWISP_App_TestCase <|-- STEER_App_TestCase
    </pre>

But several challenges emerged:

- Some tests contain hardcoded dependencies on OpenWISP apps that must be
  overridden
- The ``swapper`` tool requires many settings; we provide defaults loaded
  in the app's ``ready()`` method
- Certain settings must be overridden at import time, during Django
  initialization
- Duplicating URL configuration structures proved to be the clearest way
  to override views and routes
- Import order can affect Django initialization, leading to subtle and
  difficult issues
- Celery tasks are widely imported transitively, making overrides complex
  (though we have not needed this yet)

Database Migration Strategy
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Instead of generating new migrations and attempting to reconcile them with
existing OpenWISP migrations, we adopted a different strategy:

.. raw:: html

    <pre class="mermaid">
    stateDiagram-v2
    direction LR
    OW: OpenWISP DB (vN)
    STEER: STEER DB (vN)
    STEER_UP: STEER DB (vN+1)
    OW --> STEER: Migrate OW to STEER (fake-apply duplicated migrations, remap ContentTypes)
    STEER --> STEER_UP: Apply upstream OpenWISP migrations
    STEER --> STEER_UP: Apply custom STEER migrations (via custom command for inconsistent states)
    </pre>

- Duplicate migrations from original OpenWISP modules, adjusting
  dependencies as needed
- Explicitly reference existing database tables and constraints
- Add custom changes as additional migrations with an offset for future
  upgrades
- Provide a management command to fake-apply migrations when equivalent
  OpenWISP migrations already exist
- Handle ContentType migration first by remapping original entries to
  extended apps while preserving foreign keys
- Ensure all migrations are reversible, allowing safe rollback and
  reapplication
- Develop a custom command to handle forward migration from inconsistent
  migration states by temporarily reverting and reapplying custom
  migrations

Specific Module Concerns
~~~~~~~~~~~~~~~~~~~~~~~~

Some modules are more difficult to extend:

- ``openwisp-monitoring``: initialization logic in database backends
  complicates partial overrides, especially for query handling
- ``openwisp-firmware-upgrader``: modifying forms and extending
  controllers remains challenging, and not all tests pass in extended
  setups

Deployment and Git Workflow
~~~~~~~~~~~~~~~~~~~~~~~~~~~

We use a custom Ansible setup, partially based on the `ansible-openwisp2
<https://github.com/openwisp/ansible-openwisp2>`_ role, overriding tasks
where necessary.

.. raw:: html

    <pre class="mermaid">
    flowchart LR
    UP[upstream OpenWISP]
    subgraph StellarGit["Stellar Git"]
    direction LR
    OWDEV[master branch<br/>vanilla OpenWISP extension]
    STELLARDEV[dev branch<br/>STEER customizations]
    OWDEV -- periodic merges --> STELLARDEV
    STELLARDEV -- cherrypicks --> OWDEV
    end
    CI[CI pipelines<br/>OpenWISP-like QA]
    ANS[Custom Ansible<br/>based on ansible-openwisp2]
    QA[STEER deployment environment for QA<br/>GLOBBLE routers fleet]
    UP -- release upgrade --> OWDEV
    OWDEV -- upstream contributions --> UP
    STELLARDEV --> CI
    CI --> ANS --> QA
    </pre>

This approach allows us to:

- Keep our Django project configuration in source control
- Minimize runtime configuration variability
- Simplify deployments for our specific use case

Our Git workflow consists of:

- One branch tracking upstream OpenWISP changes
- One branch for internal development, regularly merged with upstream
  updates

We use CI pipelines similar to those in OpenWISP repositories, ensuring
that any upstream contributions have already passed automated QA checks in
our environment.

Organizational Choices
~~~~~~~~~~~~~~~~~~~~~~

Given our limited resources and need for controlled customization:

.. raw:: html

    <pre class="mermaid">
    flowchart LR
    subgraph Development["1-Dev Flow"]
    Develop[Develop<br/>local LAN<br/>NO_MANAGEMENT_IP]
    UnitTests[Unit Tests]
    LANTests[LAN Tests<br/>manually per-package]
    Develop --> UnitTests
    UnitTests -- problems ? --> Develop
    UnitTests --> LANTests
    LANTests -- Issues found --> Develop
    LANTests -- all good ? --> Release
    end
    Release[Release<br/>tag &amp; publish package<br/>as frequently as needed]
    InternalDeploy[Deploy<br/>bump version in Django project<br/>single pipeline, env vars / feature flags]
    Maintain[Maintain<br/>Goal: minimize maintenance overhead]
    Release --> InternalDeploy --> Maintain
    Maintain -- Issue ? --> Develop
    </pre>

- Each repository can run independently in a local LAN (using
  ``NO_MANAGEMENT_IP``)
- Manual testing and releases are performed per package
- Deployments typically use the latest version of each package

Additional practices:

- Final Django project resides in a separate repository with recommended
  settings
- Limited customization via environment variables (controlled feature
  flags)
- Frequent releases preferred over deploying unreleased pipeline artifacts
- Single deployment pipeline with environment-based configuration
- Strong focus on minimizing maintenance overhead

Challenges and Lessons Learned
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This project has been a valuable real-world experience in transitioning
from a standard OpenWISP setup to a fully extended architecture.

While upstreaming changes required significant effort, it provides
long-term benefits:

- Ensures licensing compliance
- Improves the ecosystem for all users
- Reduces long-term maintenance burden

We identified areas for improvement in OpenWISP:

- Not all modules fully support extensibility (e.g., firmware upgrader)
- Debugging can be difficult due to cross-module test dependencies
- Running tests across module boundaries remains challenging

Despite these challenges, this transition has been essential to
maintaining the performance and reliability of our GLOBBLE routers.

Closing Thoughts
----------------

We are now operating a fully extended OpenWISP setup, enabling efficient
internal development and active contribution to the community.

Many technical details have been omitted, but we hope this overview is
useful to others facing similar challenges.

If you are working on similar extensions or facing related challenges, we
encourage you to engage with the OpenWISP community and share your
experience.

We would like to thank the OpenWISP team, and in particular Federico
Capoano (OpenWISP Lead Maintainer), for their work and continued support
of the community.

Stay safe and connected.
