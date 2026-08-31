GSoC 2026: Mass Commands: Run Shell Commands on Many Devices at Once
====================================================================

:date: 2026-08-31
:author: Deepanshu Sahu
:tags: gsoc, openwisp-controller, new-features
:category: gsoc
:lang: en

..
    TODO: add the cover image of the project and the related metadata
    (:image_url:, :image_width:, :image_height: fields above), e.g.
    images/blog/gsoc26/mass-commands/gsoc-26-mass-commands.png

..
    TODO: cover image
    .. image:: {static}/images/blog/gsoc26/mass-commands/gsoc-26-mass-commands.png
        :alt: Google Summer of Code, Mass Commands in OpenWISP
        :align: center

Participating in Google Summer of Code for a second time has been an
equally rewarding experience. Over the past three months, I worked on my
Google Summer of Code project with OpenWISP, where I had the opportunity
to enhance the platform by bringing mass command execution to it. With the
constant guidance, encouragement, and expertise of my mentors `Federico
Capoano (nemesifier) <https://github.com/nemesifier>`_ and `Gagan Deep
(pandafy) <https://github.com/pandafy>`_, I was able to explore new parts
of the stack, tackle complex problems, and deliver features that let
operators manage large networks with a single operation instead of
repeating the same task device by device. Their insightful feedback,
patience, and supportive mentorship played a crucial role in helping me
grow as a developer and a contributor to open-source projects.

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

Running the same command on many devices used to be a manual task in
OpenWISP: an operator had to open each device page and trigger the command
one device at a time. That is acceptable for a handful of routers, but it
does not scale to a real network with hundreds or thousands of devices.

The project makes this a single operation. Operators can now target
devices by organization, device group and location, or pick them one by
one from the device list, review the exact set of devices which will be
affected, and then execute the command on all of them in the background,
while following the progress of every single device in real time.

The work adds a set of enhancements to `openwisp-controller
<https://github.com/openwisp/openwisp-controller>`_: a new model with an
asynchronous execution pipeline, REST API endpoints, a multi step Django
admin workflow, a WebSocket endpoint for real-time updates, and the
documentation which ties everything together.

Building Mass Commands
----------------------

The feature was built incrementally, one piece at a time. The data model
and the REST API came first, so that a mass command could be created and
executed in the background. The admin workflow was built on top of them,
adding a guided way to compose a command, review the devices it will reach
and follow the results as they arrive. The last piece was the entry point
from the device list, which lets operators hand a manual selection of
devices over to the very same workflow.

..
    TODO: add a before/after or overview screenshot of the mass command
    workflow, e.g.
    images/blog/gsoc26/mass-commands/mass-command-overview.png

Features Implemented
--------------------

Mass Command Model and REST API
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A new ``BatchCommand`` model keeps track of every mass command: its
organization, status (*idle*, *in-progress*, *success*, *failed*), command
type and input, the targets which were used, a label and optional notes,
the devices it affects and the devices which had to be skipped. Each
individual ``Command`` is linked back to the batch it belongs to, so the
existing command execution machinery is reused as is.

The execution is fully asynchronous: the request creates the
``BatchCommand``, a Celery task resolves the targets, creates one
``Command`` per eligible device, keeps the aggregated status of the batch
updated and enqueues the individual commands, which are then executed over
SSH. The devices for which a command cannot be created are not executed:
they are recorded separately on the batch as skipped devices, together
with the reason.

Three REST API endpoints are available:

- ``POST /api/v1/controller/batch-command/execute/`` starts a mass command
  and returns the identifier of the batch;
- ``GET /api/v1/controller/batch-command/execute/`` performs a dry run,
  returning the devices which would be affected without executing
  anything;
- ``GET /api/v1/controller/batch-command/{id}/`` returns the status of a
  batch, the number of affected devices and the skipped devices with the
  reason why they were skipped.

Admin Workflow
~~~~~~~~~~~~~~

..
    TODO: add a GIF of the two step admin workflow, e.g.
    images/blog/gsoc26/mass-commands/mass-command-execute.gif

Mass commands can be sent from the browser through *Network Operations* >
*Mass command execute*. The workflow is divided in two steps.

The first step collects the command type and its inputs, which change
according to the type selected, a label to identify the mass command
later, optional notes, and the targets: organization, device group and
location. Using more than one target narrows the selection, so a group and
a location together match only the devices which are in that group *and*
at that location. Superusers can leave every target empty to reach all the
devices of the system, while other users must choose at least one target
and only see the command types enabled for their organizations.

The second step shows a summary of the command together with the list of
the matched devices, built with the same dry run logic used by the API.
Devices can be left out by unchecking them, the counter and the *Execute
on N devices* button follow the selection while paging through the list,
and going back keeps the form filled in. The device table is composed at
request time from the device admin, so columns added by other modules such
as `openwisp-monitoring
<https://github.com/openwisp/openwisp-monitoring>`_ are shown here as
well.

Real-Time Monitoring
~~~~~~~~~~~~~~~~~~~~

..
    TODO: add a GIF showing the results page updating in real time, e.g.
    images/blog/gsoc26/mass-commands/mass-command-realtime.gif

Once the mass command starts, the operator lands on the mass command page,
which shows the status of the batch, how many devices are affected, the
skipped devices and one row per device with its status, output and last
modification time.

The page is updated in real time through a new WebSocket endpoint,
``ws/controller/batch-command/<uuid:pk>``, so there is no need to reload
it to follow a rollout which affects many devices. The consumer only
accepts authorized superusers and staff users who manage the organization
of the mass command, and pushes two kinds of messages: one for the status
of the batch and one for the result of each device. A client which
connects while a mass command is already running can also request the
current state and receive the results it missed, one page at a time.

The results table can be searched by device name and filtered by status,
device group and location, and by organization for superusers, which makes
it easy to isolate the devices which failed in a large rollout.

Execution from the Device List
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

..
    TODO: add a GIF of the "Execute mass command" admin action on the
    device changelist, e.g.
    images/blog/gsoc26/mass-commands/mass-command-changelist-action.gif

Targeting by organization, group and location covers most of the common
cases, but sometimes an operator simply knows which devices need the
command. For this reason an *Execute mass command* action was added to the
device list: the selected devices are handed over to the same two step
workflow, with the organization prefilled and the target fields hidden,
and they can still be excluded individually in the confirmation step.

The action is only available to users who have the permission to add mass
commands, and selections spanning multiple organizations are rejected,
unless the command is a system wide one.

Skipped Devices
~~~~~~~~~~~~~~~

A device is skipped when the command cannot be created for it, for example
when the device has no access credentials, or when the command type is not
enabled for its organization. Skipped devices are never silently dropped:
they are counted in the batch, listed in the results table with the
*skipped* status and the reason as their output, and they can be isolated
with the status filter. This way it is always clear why a device was not
reached.

Current State
-------------

We are maintaining the `gsoc26-mass-commands
<https://github.com/openwisp/openwisp-controller/tree/gsoc26-mass-commands>`_
branch of `openwisp-controller
<https://github.com/openwisp/openwisp-controller>`_ as the parent branch
of all the mass command work. The model and the REST API have been merged
into it, while the admin workflow and the execution from the device list
are currently under review. The feature is documented in the branch
documentation, both for the admin workflow and for the REST and WebSocket
APIs.

Mass commands are therefore not available in ``master`` yet: once all the
pull requests are merged and the feature is tested and validated, it will
be released with the next version of OpenWISP.

You can follow the development process and explore the implementation
details in the following pull requests:

- `Mass Command model and REST APIs for async command execution
  <https://github.com/openwisp/openwisp-controller/pull/1395>`_ (merged
  into the feature branch)
- `Django admin workflow for mass commands with real-time monitoring
  <https://github.com/openwisp/openwisp-controller/pull/1420>`_
- `Mass command execution from the device changelist selection
  <https://github.com/openwisp/openwisp-controller/pull/1462>`_

My Experience
-------------

Last year's GSoC with OpenWISP was an amazing experience, and being able
to do it a second time has been an absolute pleasure. Coming back to a
codebase and a community I already knew allowed me to move faster, focus
on the design decisions which really mattered, and take on a project which
touches the whole stack, from the data model up to the user interface.

Working again with `Federico Capoano (nemesifier)
<https://github.com/nemesifier>`_ and `Gagan Deep (pandafy)
<https://github.com/pandafy>`_ has been the most valuable part of the
program. Their reviews were detailed and demanding in the best possible
way: they pushed me to think about multi-tenancy and permissions, database
query efficiency, idempotency of background tasks, and the small details
of the user experience which make a feature actually usable in production.
I learned a lot along the way, and I am well aware that there is still a
lot left to learn.

The hardest parts were making the confirmation step reuse the device
admin, keeping the state of the wizard consistent across steps and entry
points, and making the real-time updates reliable without flooding the
browser or the database. Solving these problems taught me how to break a
large feature into pieces which can be reviewed and merged one at a time.

Beyond the code, taking part in the discussions of the community was once
again something I genuinely enjoyed. I am looking forward to staying
around and helping the community more in the coming years.

What's Next?
------------

The next step is making mass commands more resilient to failure cases. A
mass command runs on many devices at once, so failures are not the
exception but a normal part of a large rollout: devices which are offline,
connections which time out, background tasks which are interrupted while a
batch is running. I want the feature to recover from these situations on
its own and always leave the batch in a consistent state, so that an
operator can trust the result of a rollout without checking device by
device.

My goal is to get all the features of this project merged into master, so
that mass commands feature can ship completely in the next release of
openwisp next year.

Another extension of this work is the command model itself, together with
its admin view. The way recent commands are exposed today comes with a
number of limitations, and now that commands are also created in bulk
these limitations are more visible. Reworking the model and giving it a
proper admin view would make it much easier to look up what was executed
on a device, when, and with which result, both for single and mass
commands.

Finally, this work can benefit other modules. Mass commands are built on
the same idea of batch execution used by the `firmware upgrader
<https://github.com/openwisp/openwisp-firmware-upgrader>`_, and the two
can converge: what was learned here about targeting devices, tracking a
batch and following its progress in real time can be applied there to make
batch upgrades more resilient as well.

Beyond this project, I plan to keep maintaining what I built during both
editions of the program, fixing bugs, reviewing contributions and helping
new contributors onboard. Open source has given me a lot over these two
years, and I intend to keep giving back to the OpenWISP community for a
long time.
