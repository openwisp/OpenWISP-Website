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
to manage our growing fleet. We currently manage several hundred GLOBBLE
routers across multiple OpenWISP instances, with over a hundred routers
per instance. For the past two years, we've leveraged `OpenWISP
<https://openwisp.org/>`_ to remotely manage our dual-cellular + WAN
connections. Our core OpenWISP development team consists of one to two
senior developers (depending on availability and business constraints)
with backgrounds in software development, networking, and system
administration, while a separate operations team handles day-to-day router
maintenance using the platform.

The Map
-------

We began our journey with an `Ansible <https://www.ansible.com/>`_-based
deployment of the original OpenWISP. From the outset, we did not utilize
the Wi-Fi-related modules, as they were not relevant to our use case. It
can be argued that our goals differ slightly from OpenWISP's original aim
(managing Wi-Fi hotspots). However, most of the required features are
similar enough that collaboration remains beneficial.

.. raw:: html

    <style>
    pre.stellar-diagram { margin: 1.5rem 0; text-align: center; }
    pre.stellar-diagram svg { display: inline-block; max-width: 100%; height: auto; }
    </style>
    <pre class="mermaid stellar-diagram">
    %%{init: {"theme": "base", "themeVariables": {
      "lineColor": "#8b949e", "textColor": "#1f2933", "nodeTextColor": "#1f2933",
      "edgeLabelBackground": "#f1f3f5"
    }, "flowchart": {"subGraphTitleMargin": {"top": 16, "bottom": 16}, "nodeSpacing": 50, "rankSpacing": 70}}}%%
    flowchart LR
        subgraph MODULES["OpenWISP modules used by Stellar"]
            direction LR
            USERS["OpenWISP Users"]
            NOTIFICATIONS["OpenWISP Notifications"]
            CONTROLLER["OpenWISP Controller"]
            MONITORING["OpenWISP Monitoring"]
            FIRMWARE["OpenWISP Firmware Upgrader"]
        end

        classDef upstream fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,font-weight:bold
        class USERS,NOTIFICATIONS,CONTROLLER,MONITORING,FIRMWARE upstream
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

    <pre class="mermaid stellar-diagram">
    %%{init: {"theme": "base", "themeVariables": {
      "lineColor": "#8b949e", "textColor": "#1f2933", "nodeTextColor": "#1f2933",
      "edgeLabelBackground": "#f1f3f5"
    }, "flowchart": {"subGraphTitleMargin": {"top": 16, "bottom": 16}, "nodeSpacing": 50, "rankSpacing": 70}}}%%
    flowchart LR
        subgraph USERS["User management"]
            direction LR
            OPENWISP_USERS["OpenWISP Users"] -->|extended as| STEER_USERS["STEER Users"]
        end
        subgraph NOTIFICATIONS["Notifications"]
            direction LR
            OPENWISP_NOTIFICATIONS["OpenWISP Notifications"] -->|extended as| STEER_NOTIFICATIONS["STEER Notifications"]
        end
        subgraph CONTROLLER["Device control"]
            direction LR
            OPENWISP_CONTROLLER["OpenWISP Controller"] -->|extended as| STEER_CONTROLLER["STEER Controller"]
        end
        subgraph MONITORING["Monitoring"]
            direction LR
            OPENWISP_MONITORING["OpenWISP Monitoring"] -->|extended as| STEER_MONITORING["STEER Monitoring"]
        end
        subgraph FIRMWARE["Firmware upgrades"]
            direction LR
            OPENWISP_FIRMWARE["OpenWISP Firmware Upgrader"] -->|extended as| STEER_FIRMWARE["STEER Firmware Upgrader"]
        end

        classDef upstream fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,font-weight:bold
        classDef extension fill:#ed7800,stroke:#b35b00,color:#ffffff,font-weight:bold
        class OPENWISP_USERS,OPENWISP_NOTIFICATIONS,OPENWISP_CONTROLLER,OPENWISP_MONITORING,OPENWISP_FIRMWARE upstream
        class STEER_USERS,STEER_NOTIFICATIONS,STEER_CONTROLLER,STEER_MONITORING,STEER_FIRMWARE extension
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
- Maintain our technology stack: OpenWISP 24.11, `Django 4.2
  <https://www.djangoproject.com/>`_, `Python 3.11
  <https://www.python.org/>`_, `Debian 12 <https://www.debian.org/>`_
- Enable thorough testing and facilitate upstream contributions

We have since upgraded to Django 5.2 and Python 3.13 on Debian 13.

Our Python development environment for each module is intentionally
simpler than OpenWISP's:

- Initially based on `direnv <https://direnv.net/>`_ and `asdf
  <https://asdf-vm.com/>`_ for environment management; recently migrated
  to `mise <https://mise.jdx.dev/>`_
- Use of `pip-tools <https://pip-tools.readthedocs.io/>`_ to pin exact
  dependency versions per Python and codebase version
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

    <pre class="mermaid stellar-diagram">
    %%{init: {"theme": "base", "themeVariables": {
      "lineColor": "#8b949e", "textColor": "#1f2933", "nodeTextColor": "#1f2933",
      "edgeLabelBackground": "#f1f3f5"
    }, "flowchart": {"nodeSpacing": 50, "rankSpacing": 70}}}%%
    classDiagram
    direction TB
    class OpenWISP_App
    class STEER_App
    class OpenWISP_App_TestCase
    class STEER_App_TestCase
    OpenWISP_App <|-- STEER_App : extends
    OpenWISP_App_TestCase <|-- STEER_App_TestCase : extends
    classDef upstream fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,font-weight:bold
    classDef extension fill:#ed7800,stroke:#b35b00,color:#ffffff,font-weight:bold
    cssClass "OpenWISP_App,OpenWISP_App_TestCase" upstream
    cssClass "STEER_App,STEER_App_TestCase" extension
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
- `Celery <https://docs.celeryq.dev/>`_ tasks are widely imported
  transitively, making overrides complex (though we have not needed this
  yet)

Having default settings makes juggling multiple Django apps much more
manageable. It is a small and simple piece of code, but it makes extending
OpenWISP a much more practical choice than it might seem at first. As an
example, our defaults settings (for ``swapper`` or others) for
``openwisp_steer_users`` are defined in a dedicated file:

**File: defaults.py**

.. code-block:: python

    # Because we extend openwisp-users
    # Setting models for swapper module
    OPENWISP_USERS_GROUP_MODEL = "openwisp_steer_users.Group"
    OPENWISP_USERS_ORGANIZATION_MODEL = "openwisp_steer_users.Organization"
    OPENWISP_USERS_ORGANIZATIONUSER_MODEL = "openwisp_steer_users.OrganizationUser"
    OPENWISP_USERS_ORGANIZATIONOWNER_MODEL = "openwisp_steer_users.OrganizationOwner"

These can then be loaded during ``django.setup()`` via an extended
``AppConfig.__init__()`` or ``AppConfig.ready()``, depending on when the
settings should be activated during setup time.

As is usually the case with complex Python code like Django, using the
debugger is mandatory to understand what is actually happening when
writing code. For instance, here is what worked for us with
``openwisp_steer_users``:

**File: app.py**

.. code-block:: python

    class OpenwispExtensionUsersConfig(OpenwispUsersConfig):
        name = "openwisp_steer_users"
        label = "openwisp_steer_users"

        def __init__(self, app_name, app_module) -> None:
            super().__init__(app_name, app_module)

            from .defaults import (
                OPENWISP_USERS_GROUP_MODEL,
                OPENWISP_USERS_ORGANIZATION_MODEL,
                OPENWISP_USERS_ORGANIZATIONOWNER_MODEL,
                OPENWISP_USERS_ORGANIZATIONUSER_MODEL,
            )

            # Because we extend openwisp-users
            # Setting models for swapper module
            settings.OPENWISP_USERS_GROUP_MODEL = getattr(
                settings, "OPENWISP_USERS_GROUP_MODEL", OPENWISP_USERS_GROUP_MODEL
            )
            settings.OPENWISP_USERS_ORGANIZATION_MODEL = getattr(
                settings,
                "OPENWISP_USERS_ORGANIZATION_MODEL",
                OPENWISP_USERS_ORGANIZATION_MODEL,
            )
            settings.OPENWISP_USERS_ORGANIZATIONUSER_MODEL = getattr(
                settings,
                "OPENWISP_USERS_ORGANIZATIONUSER_MODEL",
                OPENWISP_USERS_ORGANIZATIONUSER_MODEL,
            )
            settings.OPENWISP_USERS_ORGANIZATIONOWNER_MODEL = getattr(
                settings,
                "OPENWISP_USERS_ORGANIZATIONOWNER_MODEL",
                OPENWISP_USERS_ORGANIZATIONOWNER_MODEL,
            )

The same pattern can be repeated for any django app extension you wish to
write, provided there is no interaction with module import logic. But as
always, when in doubt, trust your debugger.

Database Migration Strategy
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Instead of generating new migrations and attempting to reconcile them with
existing OpenWISP migrations, we adopted a different strategy:

.. raw:: html

    <pre class="mermaid stellar-diagram">
    %%{init: {"theme": "base", "themeVariables": {
      "lineColor": "#8b949e", "textColor": "#1f2933", "nodeTextColor": "#1f2933",
      "edgeLabelBackground": "#f1f3f5"
    }, "flowchart": {"nodeSpacing": 50, "rankSpacing": 70}}}%%
    flowchart TB
        OW["OpenWISP database<br/>version N"]
        STEER["STEER database<br/>version N"]
        UPSTREAM["Apply upstream OpenWISP<br/>migrations"]
        CUSTOM["Apply custom STEER<br/>migrations"]
        STEER_UP["STEER database<br/>version N+1"]

        OW -->|adopt extension| STEER
        STEER --> UPSTREAM --> CUSTOM --> STEER_UP

        classDef upstream fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,font-weight:bold
        classDef extension fill:#ed7800,stroke:#b35b00,color:#ffffff,font-weight:bold
        classDef processing fill:#fff1e0,stroke:#ed7800,color:#1f2933,font-weight:bold
        classDef result fill:#2f855a,stroke:#276749,color:#ffffff,font-weight:bold
        class OW upstream
        class STEER extension
        class UPSTREAM,CUSTOM processing
        class STEER_UP result
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

      **Disclaimer:** This is the approach we are currently using to
      manage deployments and automatic database upgrades. It might not be
      the best solution - or even a safe one. Do not blindly copy-paste or
      run code from the internet (or any AI). Use your own judgement
      before running any code. You are responsible for the code you
      execute, so make sure you understand it first.

Here is the command to fake-apply migrations when an equivalent OpenWISP
migration has already been applied to the database

.. code-block:: python

    class Command(BaseCommand):
        help = "Mark migrations as applied for OpenWISP extended apps"

        def add_arguments(self, parser):
            parser.add_argument(
                "--database",
                default=DEFAULT_DB_ALIAS,
                help="Nominates a database to synchronize",
            )

        def handle(self, *args, **options):
            migrations = fake_migrations_registry.get_all()
            connection = connections[options["database"]]
            executor = MigrationExecutor(connection)
            state = executor.loader.project_state()

            def cmd_msg(app_label, migration_name, msg, indent=2, style=None):
                prefix = f"{' ' * indent}- {app_label}"
                if migration_name:
                    prefix += f".{migration_name}"

                if style:
                    self.stdout.write(style(f"{prefix}: {msg}"))
                else:
                    self.stdout.write(f"{prefix}: {msg}")

            for original_app_label, (
                app_label,
                start,
                end,
                skip,
                skip_initial,
            ) in migrations.items():
                cmd_msg(app_label, None, "Faking migrations...", indent=0)

                for i in range(start, end + 1):
                    if skip and i in skip:
                        continue
                    migration_name = f"{i:04d}"
                    try:
                        # Get the migration
                        migration = executor.loader.get_migration_by_prefix(
                            app_label, migration_name
                        )
                        if not migration:
                            continue

                    except Exception as e:
                        cmd_msg(
                            app_label,
                            migration_name,
                            f"Error loading migration: {e}",
                            style=self.style.ERROR,
                        )
                        # Raise immediately, we cant even load the migration
                        raise CommandError(f"Error loading migration: {e}")

                    # Check if migration is already applied
                    if (
                        app_label,
                        migration.name,
                    ) in executor.loader.applied_migrations:
                        cmd_msg(app_label, migration.name, "SKIPPED. Already applied.")
                        continue
                    else:
                        # Check if original app migration is applied
                        if (
                            original_app_label,
                            migration.name,
                        ) not in executor.loader.applied_migrations:
                            err_msg = (
                                f"Original Migration "
                                f"{original_app_label}.{migration_name}"
                                " not applied on DB."
                            )
                            cmd_msg(
                                app_label,
                                migration.name,
                                f"ERROR. {err_msg}",
                                style=self.style.ERROR,
                            )

                            raise CommandError(
                                f"{err_msg}"
                                "\nYou might want to use `migrate` to apply "
                                f"{app_label}.{migration_name} instead."
                            )
                            # we need to stop applying migrations here, even fake ones
                            # continuing would write inconsistent history into the DB

                    try:
                        # Only use fake_initial for initial migrations,
                        # otherwise use fake=True
                        if i == start and not skip_initial and migration.initial:
                            state = executor.apply_migration(
                                state,
                                migration,
                                fake=False,  # Don't use fake here,
                                # it prevents useful checks
                                fake_initial=True,
                            )

                            cmd_msg(
                                app_label,
                                migration.name,
                                "[initial] Faked successfully",
                            )

                        else:
                            state = executor.apply_migration(
                                state, migration, fake=True, fake_initial=False
                            )

                            cmd_msg(app_label, migration.name, "Faked successfully")

                    except Exception as e:
                        # Raise immediately, we are applying migrations
                        # and we dont know what went wrong
                        raise CommandError(
                            f"Failed to fake migration {app_label}.{migration.name}. "
                            f"This usually means the tables from {original_app_label} "
                            f"app are not present. Are you running this on an existing "
                            f"OpenWISP 1.1.1 database?"
                            f"Error: {str(e)}"
                        )

            self.stdout.write(
                self.style.SUCCESS("\nSuccessfully processed all registered migrations")
            )

``fake_migrations_registry`` is a registry listing the migrations that are
duplicated from OpenWISP and, therefore, may have potentially already been
applied to the database (depending on the version of OpenWISP being
extended). This effectively allows you to deploy an extension on top of a
database that was previously used with OpenWISP.

However, to make this usable, the content types and versions in the
database need to be updated. To achieve this, the extension requires its
own migrations. To prevent issues, these migrations should be reversible
without breaking foreign keys. This way you can revert and reapply them
without losing information.

Furthermore, when running ``./manage.py migrate`` after updating the
extension itself to follow OpenWISP changes, you might end up in an
inconsistent state. This is because migrations (the openwisp duplicates)
have been added earlier in the list of applied migrations. To resolve
this, you will need to:

- First (fake-)unapply the extension specific migrations
- Then apply the openwisp-duplicated migrations to bring the DB up to date
- And finally (fake-)apply the extension specific migrations

Faking the apply/unapply process is fine when the extension specific
migrations do not change. However, when your extension specific migrations
need to change between versions, you'll have to actually unapply-reapply
them - which is when their reversibility will come in handy.

Or you can always create another migration on top.

Specific Module Concerns
~~~~~~~~~~~~~~~~~~~~~~~~

Some modules are more difficult to extend:

- ``openwisp-monitoring``: initialization logic in database backends
  complicates partial overrides, especially for query handling
- ``openwisp-firmware-upgrader``: modifying forms and extending
  controllers remains challenging, and not all tests pass in extended
  setups

We are currently collaborating with OpenWISP to make these simpler to
extend and work with other customized OpenWISP modules, helping to
maintain consistency between projects and ensuring tests can run with a
wide variety of setups. It is this kind of boring but necessary work that
keeps a project like OpenWISP meaningful for a lot of us.

Deployment and Git Workflow
~~~~~~~~~~~~~~~~~~~~~~~~~~~

We use a custom Ansible setup, partially based on the `ansible-openwisp2
<https://github.com/openwisp/ansible-openwisp2>`_ role, overriding tasks
where necessary.

.. raw:: html

    <pre class="mermaid stellar-diagram">
    %%{init: {"theme": "base", "themeVariables": {
      "lineColor": "#8b949e", "textColor": "#1f2933", "nodeTextColor": "#1f2933",
      "edgeLabelBackground": "#f1f3f5"
    }, "flowchart": {"subGraphTitleMargin": {"top": 16, "bottom": 16}, "nodeSpacing": 50, "rankSpacing": 70}}}%%
    flowchart TB
        UP["Upstream OpenWISP"]
        subgraph STELLAR_GIT["Stellar Git"]
            direction TB
            OWDEV["master branch<br/>vanilla OpenWISP extension"]
            STELLARDEV["dev branch<br/>STEER customizations"]
            OWDEV -->|periodic merges| STELLARDEV
            STELLARDEV -->|cherry-picks| OWDEV
        end
        CI["CI pipelines<br/>OpenWISP-like QA"]
        ANS["Custom Ansible<br/>based on ansible-openwisp2"]
        QA["STEER QA deployment<br/>GLOBBLE router fleet"]

        UP -->|release upgrades| OWDEV
        OWDEV -->|upstream contributions| UP
        STELLARDEV --> CI --> ANS --> QA

        classDef upstream fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,font-weight:bold
        classDef extension fill:#ed7800,stroke:#b35b00,color:#ffffff,font-weight:bold
        classDef processing fill:#fff1e0,stroke:#ed7800,color:#1f2933,font-weight:bold
        classDef result fill:#2f855a,stroke:#276749,color:#ffffff,font-weight:bold
        class UP,OWDEV upstream
        class STELLARDEV extension
        class CI,ANS processing
        class QA result
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

    <pre class="mermaid stellar-diagram">
    %%{init: {"theme": "base", "themeVariables": {
      "lineColor": "#8b949e", "textColor": "#1f2933", "nodeTextColor": "#1f2933",
      "edgeLabelBackground": "#f1f3f5"
    }, "flowchart": {"subGraphTitleMargin": {"top": 16, "bottom": 16}, "nodeSpacing": 50, "rankSpacing": 70}}}%%
    flowchart TB
        subgraph DEVELOPMENT["Single-developer flow"]
            direction TB
            DEVELOP["Develop<br/>local LAN<br/>NO_MANAGEMENT_IP"]
            UNIT_TESTS["Unit tests"]
            LAN_TESTS["LAN tests<br/>manual, per package"]
            DEVELOP --> UNIT_TESTS --> LAN_TESTS
            UNIT_TESTS -->|problems found| DEVELOP
            LAN_TESTS -->|issues found| DEVELOP
        end
        RELEASE["Release<br/>tag and publish package"]
        DEPLOY["Deploy<br/>bump Django project version"]
        MAINTAIN["Maintain<br/>minimize overhead"]

        LAN_TESTS -->|ready to release| RELEASE --> DEPLOY --> MAINTAIN
        MAINTAIN -->|issue found| DEVELOP

        classDef active fill:#ed7800,stroke:#b35b00,color:#ffffff,font-weight:bold
        classDef processing fill:#fff1e0,stroke:#ed7800,color:#1f2933,font-weight:bold
        classDef release fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,font-weight:bold
        classDef result fill:#2f855a,stroke:#276749,color:#ffffff,font-weight:bold
        class DEVELOP active
        class UNIT_TESTS,LAN_TESTS processing
        class RELEASE release
        class DEPLOY,MAINTAIN result
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

We would like to thank the OpenWISP team, and in particular `Federico
Capoano <https://github.com/nemesifier>`_ (OpenWISP Lead Maintainer), for
their work and continued support of the community.

Stay safe and connected.
