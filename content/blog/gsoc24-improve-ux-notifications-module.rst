Improve UX of the Notifications Module: GSoC’24 Project Report
==============================================================

:date: 2024-09-19
:author: Dhanus
:tags: gsoc, notifications, new-features
:category: gsoc
:lang: en

.. image:: {static}/images/blog/gsoc-improve-ux-notifications-module/gsoc_2024.svg
    :alt: GSOC 2024
    :align: center

As my Google Summer of Code (GSoC) journey with OpenWISP draws close, I
want to reflect on my gratifying experience. First and foremost, I would
like to extend my deepest gratitude to my mentors, `Federico Capaono
(nemesifier) <https://github.com/nemesifier>`_ and `Gagan Deep (pandafy)
<https://github.com/pandafy>`_. Their unwavering support, insightful
feedback, and expert guidance have been invaluable throughout this summer.
Working under their mentorship has been an incredibly enriching learning
experience, helping me better understand open-source development.

About the Project
-----------------

The **OpenWISP Notifications Module** provides email and web notifications
for the OpenWISP platform. Its primary goal is to enable other OpenWISP
modules to notify users about significant events occurring within their
network. Offering timely and relevant notifications helps users stay
informed about critical activities and changes within their managed
infrastructure.

For a complete overview of its features, refer to the `features
<https://openwisp.io/docs/dev/notifications/user/intro.html>`_ section of
the OpenWISP documentation.

My Work on Improving the User Experience (UX)
---------------------------------------------

This summer, I focused on **Improving the User Experience (UX) of the
Notifications Module**. My work involved consolidating notifications into
single emails to prevent inbox flooding, implementing global preferences
for easier notification management, and developing a REST API for
administrators. Additionally, I created a user-friendly interface for
managing notification preferences, including direct links in email footers
and an unsubscribe option. These enhancements aimed to streamline
notification management, reduce inbox clutter, and significantly improve
the overall user experience on the OpenWISP platform.

Features Implemented
--------------------

Batch Email Notifications to Prevent Email Flooding
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: {static}/images/blog/gsoc-improve-ux-notifications-module/batch_email.png
    :alt: Batch Email Summary
    :align: center

Batching email notifications helps manage the flow of emails sent to
users, especially during increased alert activity. By grouping emails into
batches, the system minimizes the risk of emails being marked as spam and
prevents inboxes from rejecting alerts due to high volumes.

Key aspects of the batch email notification feature include:

- When multiple emails are triggered for the same user within a short time
  frame, subsequent emails are grouped into a summary.
- The sending of individual emails is paused for a specified batch
  interval when batching is enabled.

**Pull Request:-** `Batch email notifications #276
<https://github.com/openwisp/openwisp-notifications/pull/276>`_

Notification Preferences Page
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: {static}/images/blog/gsoc-improve-ux-notifications-module/notification_preference_page.png
    :alt: Notification Preferences Page
    :align: center

The Notification Preferences Page allows users to manage their
notification settings through a user-friendly interface. This enhancement
gives users greater control over how they receive notifications, enabling
them to disable notifications for all organizations or selectively enable
notifications for specific organizations. The page also offers
administrators to manage notification preferences for other users.

Key aspects of the notification preference feature include:

- **Global Preferences:** Users can disable notifications for all
  organizations or keep notifications enabled for specific organizations
  only.
- **REST API:** Administrators can manage the notification preferences of
  other users via a dedicated API.
- **Dedicated View:** A user-friendly UI to manage all notification
  preferences in one place.

**Pull Request:-** `Notification Preferences Page #290
<https://github.com/openwisp/openwisp-notifications/pull/290>`_

Add Unsubscribe Link to Email Notifications
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: {static}/images/blog/gsoc-improve-ux-notifications-module/unsubscribe_page.png
    :alt: Unsubscribe Page
    :align: center

To enhance user control over email notifications, I implemented an
unsubscribe link in the footer of all email notifications. This feature
allows users to easily manage their email preferences, including opting
out of all notifications without logging into the platform. By adding this
functionality, we ensure compliance with best practices for email
notifications and reduce the likelihood of emails being marked as spam.

Key aspects of the unsubscribe link feature include:

- **Manage Notification Preferences:** A link in the email footer directs
  users to the page to manage notification preferences.
- **Unsubscribe from All Emails:** An option allowing users to turn off
  all notifications directly from the email.
- **List-Unsubscribe Header:** Implement the ``List-Unsubscribe-Header``
  to facilitate the unsubscribe button functionality in email clients.

**Pull Request:-** `Add unsubscribe link to email notifications #307
<https://github.com/openwisp/openwisp-notifications/pull/307>`_

Other Contributions
-------------------

In addition to my main project, I made several other contributions to the
organization, improving various features, fixing bugs, and enhancing the
overall functionality of the modules. Here are some of the additional PRs
I worked on:

**OpenWISP Notifications**

- `Relative URL for notification links #266
  <https://github.com/openwisp/openwisp-notifications/pull/266>`_
- `Do Not Send Email Notifications if User Email is Not Verified #274
  <https://github.com/openwisp/openwisp-notifications/pull/274>`_
- `Added generic message notification type (shown in dialog box) #275
  <https://github.com/openwisp/openwisp-notifications/pull/275>`_

**OpenWISP Controller**

- `Unsaved changes alert disable on preview view #857
  <https://github.com/openwisp/openwisp-controller/pull/857>`_
- `Dark table preview when using django-import-export #858
  <https://github.com/openwisp/openwisp-controller/pull/858>`_
- `deviceconnection_unique_together fails due to duplicate objects #861
  <https://github.com/openwisp/openwisp-controller/pull/861>`_

**OpenWISP Monitoring**

- `Random pause for every 10 successful sent requests #131
  <https://github.com/openwisp/openwrt-openwisp-monitoring/pull/131>`_

My Experience
-------------

My GSoC journey with OpenWISP has been an incredible learning experience.
I gained valuable skills, particularly in writing tests and reusing
existing solutions, which improved my code's efficiency and reliability.
The mentors played a huge role in helping me refine my work, offering
insightful feedback that enhanced my coding skills and deepened my
understanding of open-source development.

What’s Next?
------------

As my GSoC journey concludes, I’m excited to keep contributing to OpenWISP
and other open-source projects. I plan to focus on fixing bugs, enhancing
features, and tackling new challenges. I also look forward to helping new
contributors to get started in their open-source journey.
