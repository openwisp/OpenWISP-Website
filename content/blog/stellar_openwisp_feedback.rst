Stellar's OpenWisp Adoption Journey
===================================

:date: 2026-05-05
:author: Alexandre Vincent
:tags: ??
:category: ??
:lang: en

..
    :image_url: https://openwisp.org/images/blog/gsoc26/openwisp-10-years-google-summer-of-code.webp
    :image_width: 798
    :image_height: 532

At `Stellar Telecommunications<http://stellar.tc>`_, we build connectivity solutions for the world's most demanding environments.
Our flagship product, the GLOBBLE router, is a multilink router that uses our proprietary STEER software to deliver ubiquitous, high-speed internet.
By seamlessly connecting to and intelligently switching between cellular, Wi-Fi, and satellite networks, GLOBBLE aims to ensures an industry-leading 99% internet availability.

As we've scaled, we've relied on powerful open-source tools to manage our fleet of GLOBBLE routers.
For the past two years, we've leveraged OpenWISP to allow us to remotely manage our Dual-Cellular + WAN connections at scale.
Our team working on OpenWISP (and related topics) consists of one to two senior devs (depending on availability and other business constraints), with backgrounds primarily in software, network, and system administration.

The map
-------

We began our journey with an Ansible-based deployment of the original OpenWISP.
From the outset, we did not utilize the Wi-Fi-related modules, as they were not relevant to our specific use case.
It can be argued that our purpose might be slightly different from openwisp original aim (providing management capabilities to WiFi hotspots).
However most of the required features are the same, or similar enough that it makes sense for us to coordinate our efforts.

After a couple of years using a somewhat limited set of features of OpenWisp, we reached the limitation of using the original version:
- No custom configuration for our proprietary routers (based on OpenWRT but with extra features)
- No adjustment for our daily usage and the newly formed habits of our Operations Team
- What about improvement that would be useful to us, but mabe a burden to OpenWisp community, or at least would take a long time to integrate into master branch
- What about customers who wanted some sort of solution to manage the routers they would buy from us.

=> We would need to fork the repo and manage all our modifications directly on the repo source,
which was working for a while, but eventually became unsustainable due to all the conflicting changes from various sources.

Seeing that OpenWisp was made with the explicit intent for anyone to extend it for their own usage,
we got to work and developed an extended version of it to host our own hacks, modifications, features,
but also regression tests, development environment setup, etc.

We followed the official documentation to extend OpenWISP modules.
When the documentation was not fully up-to-date, we found that the automated tests served as a reliable reference.

for the full technical story, read the next chapter "The territory".

Our primary achievement has been the successful transition from an ad-hoc, forked installation of OpenWISP to a fully extended setup.
This new architecture allows us to develop custom code tailored to our specific routers while also enabling us to identify, fix, and contribute solutions for OpenWISP issues back to the main project in a relatively short time frame.


The territory
-------------

Our technical approach was guided by a set of clear constraints:
 
- Do not lose past data.
- Make the database migration process as simple and safe as possible.
- Maintain our existing technology stack: OpenWISP 24.11, Django 4.2, Python 3.11, and Debian 12.
- Establish the ability to thoroughly test all code, and quickly upstream relevant changes.

We have since updated to to Django 5.2, Python 3.13 on Debian 13.

Our python dev environment for each module is perhaps simpler than OpenWisp's one:
- We started with direnv + asdf to manage virtual environments, and we recently we moved to mise.
- pip-tools to manage exact the version of dependencies for a specific version of python itself, and the code. Note that this is workable since noone is supposed to depend on that custom version.
- We aim to run all tests from any openwisp dependency module, from any repo.
  This is not yet possible, due to various constraints, but we are working on improving the situation,
  as it would ensure underlying modules are working as expected, no matter the settings of hte current django project (which might be modified by various actors).

## Code and Module Extension

 During this process, we noted that for Python code, inheritance is generally effective. However, we encountered several challenges:
 
- Some tests contain hardcoded dependencies to OpenWISP apps which need to be overridden.
- The `swapper` tool requires a significant number of settings, so we actually have default settings that are loaded by the app's ready() method.
- Certain settings are used at import time, so they need to be overridden at import time, while django is still being setup.
- We found that duplicating the URL configuration structure in our extended app was the clearest way to handle overriding URLs and views.
- In rare cases, the import order makes django initialization happen in the wrong order, leading to settings not being taken into account, and other tricky issues.
- Celery tasks are imported everywhere (transitively when importing the module) -> overriding existing tasks might be troublesome. However we didn't need to so far.

## Database Migration Strategy
 
While the documentation usually explains how to change models and we could regenerate migrations, it seemed overly complex to get these newly-generated migrations to play nicely with the existing openwisp database, and migrations, and their interdependencies.
Instead, we adopted the following strategy:
 
- We duplicated the migrations from the original OpenWISP modules, fixing dependencies when needed.
- We also specified the tables & constraints names to point to the original OpenWISP tables & constraints.
- Our custom changes were added in migrations on top, with an offset for future upgrades.
- We created a management command that fake-apply the migration if the equivalent openwisp migration is already applied on DB.
- Our very first migration for extended apps concerns Content Types: original openwisp contenttype needs to be renamed to point to extended app (attempting to keep the foreign keys unchanged in exiting data)
- All migrations for the extended version need to be reversible (with a backup/restore behaviour on migrate forward), so that we can reverse them, apply updated openwisp migrations, and migrate upwards to restore our own data.
- Another custom management command was developed to migate the database forward, from a "broken" history graph (migrations in the updates have not been applied, which currently works by fake-reverting our custom migrations before upgrading openwisp, and then fake-reapplying our custom migrations.

## Specific modules concerns

- openwisp-monitoring can be tricky to extend. For instance, the code in __init__ in db.backends make it harder than necessary to replace only part of it (specifically queries to also access monitoring data, stored either via openwisp2 or the current app)
- openwisp-formware-upgrader modifies forms and I have yet to succeed getting all tests to pass with an extended controller...

 
## Deployment and Git Flow
 
For deployment, we use our own Ansible configuration, including/importing task from the original `ansible-openwisp2` role and overriding some when needed.
This approach allows us to keep our Django project/website with all (safe) settings in source and reduce the amount of settings that can be changed, which simplifies our specific use case.
 
Our git workflow involves one branch to integrate changes from OpenWISP, and one branch to integrate our changes, where we periodically merge openwisp changes.
We use a pipeline similar to the one on openwisp github repos, so whenever we pick a set of changes to upstream it, it has been running in our setup and already passed automated openwisp-qa-checks.
 
 
## Organisational choices (given our limited resources and restricted customization options):

- Each repository is separately runnable in local LAN (via NO_MANAGEMENT_IP setting)
- Each package manual testing (on LAN environment) and release is therefore independant.
- When deploying the whole solution, we can, most of the time, grab the latest of each package.

- Final django project in separate repo (with recommended settings) and independently testable (on LAN setup) by any dev.
- We rely on envvar for a very limited customization (no extensibility, only a few tested combination of "flag options", etc.)
- No need to deploy unreleased version of packages from pipeline (we prefer to release as often as necessary)
- One straight pipeline, modifying only envvars, using latest version of packages
- We aim to keep our maintenance effort minimal. 


## Challenges and Lessons Learned
 
This project has been a valuable learning experience, providing a real-world example of moving from a standard OpenWISP installation to a custom, extended version.
 
While the initial effort to upstream our changes was significant, we recognize its long-term value.
Contributing back to the master branch ensures not only licensing compliance, but also that the entire OpenWISP community, and by extension our own platform, benefits from our findings and fixes.
 
Our work has uncovered areas where the platform can evolve, which we're actively contributing to.
We discovered that not all modules fully support extension; for example, we encountered issues with the `firmware-upgrader` module when using an extended controller.
We also found that debugging can be difficult, as the tests of one module often do not run correctly from a dependent module, sometimes making it hard to pinpoint where a problem lies.
 
Ultimately, this challenging transition was a crucial step in ensuring our GLOBBLE routers remain at the forefront of the industry, delivering the reliability and performance our customers expect.
 
 


Closing Thoughts
----------------

We are now operating a fully extended OpenWISP setup.
This allows us to efficiently develop our own features and contribute fixes back to the community.

Many details have been omitted in this summary, but we hope this overview of our experience will be useful for some of you.
 
I'd like to thank the OpenWISP team, and in particular Federico Capoano, for their work and ongoing support of the community.
 
Stay safe and connected out there.

