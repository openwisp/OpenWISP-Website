GSoC 2026: X.509 Certificate Generator Templates
================================================

:date: 2026-09-12
:author: Sarthak Tyagi
:tags: gsoc, openwisp-controller, x509, certificates, new-features
:category: gsoc
:lang: en
:image_url: https://openwisp.org/images/blog/gsoc26/x509-certificate-generator-templates/cover.webp
:image_width: 1920
:image_height: 1080

.. image:: {static}/images/blog/gsoc26/x509-certificate-generator-templates/cover.webp
    :alt: Google Summer of Code, X.509 Certificate Generator Templates in OpenWISP
    :align: center
    :target: /blog/gsoc-2026-x509-certificate-generator-templates/

Google Summer of Code with OpenWISP has easily been one of the highlights
of my journey as a developer. Over the last three months I worked on
bringing standalone X.509 certificate generation to the platform, which
gave me the chance to explore unfamiliar corners of the stack, take on
tricky problems, and ship a feature that frees certificate management from
being tied exclusively to VPN tunnels, turning it into a general-purpose
capability. None of this would have been possible without the steady
guidance and expertise of my mentors `Federico Capoano (nemesifier)
<https://github.com/nemesifier>`_ and `Aryaman (Aryamanz29)
<https://github.com/Aryamanz29>`_. Their thoughtful feedback, patience,
and generous mentorship were invaluable in helping me grow both as a
developer and as an open-source contributor.

About the Project
-----------------

..
    TODO: embed the final demo video of the project
    .. raw:: html

        <iframe width="560" height="315"
                style="width:100%; height:700px;"
                src="https://www.youtube.com/embed/VIDEO_ID?vq=hd1080"
                title="OpenWISP X.509 Certificate Generator Templates Demo"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
        </iframe>

Until now, OpenWISP could generate X.509 certificates only for `OpenVPN
<https://openvpn.net/>`_ clients, where each VPN client template produces
a certificate signed by the CA linked to the corresponding VPN server.
Anyone who needed a certificate for a different purpose, such as securing
a web service, authenticating devices against an internal API, or using
device identities with 802.1x or captive portals, was forced to attach an
unnecessary VPN configuration just to obtain one.

The project makes certificate generation a **first-class, general-purpose
feature**. Administrators can now create a *Certificate generator*
template, choose the Certificate Authority that signs the certificates
and, optionally, an existing certificate to reuse as a blueprint. OpenWISP
then generates a certificate automatically for every device the template
is assigned to. That certificate is bound to the device's cryptographic
identity, can be consumed by the configuration engine, and is revoked
automatically when it is no longer needed.

The work adds a set of enhancements to `openwisp-controller
<https://github.com/openwisp/openwisp-controller>`_:

- a new template type and relational model;
- an automated provisioning and revocation lifecycle;
- custom device identification OIDs;
- context variables for configuration templates;
- automatic regeneration on hardware changes;
- `Django <https://www.djangoproject.com/>`_ admin and REST API
  integration;
- documentation that ties everything together.

Building X.509 Certificate Generator Templates
----------------------------------------------

The feature was built incrementally, one piece at a time. The data model
came first, extending the existing ``AbstractTemplate`` to support a new
``cert`` type and introducing the relational bridge that links each
generated certificate to a device configuration and to the template that
produced it. The lifecycle engine followed, so that assigning a template
generates a certificate in the same transaction, unassigning it revokes
the certificate, and renewing it triggers a configuration update. With the
backend in place, the certificate payload was exposed to the configuration
engine as UUID-namespaced variables, automatic regeneration on hardware
changes was added to keep certificates in sync with the devices, and
finally the Django admin and the REST API were updated to make the whole
feature usable from the browser and from automation scripts.

Features Implemented
--------------------

Certificate Template Model
~~~~~~~~~~~~~~~~~~~~~~~~~~

A new ``cert`` type was added to the existing ``AbstractTemplate`` model,
exposed in the admin as *Certificate generator*, together with two new
relational fields:

- ``ca``, a required ``ForeignKey`` to the ``pki.Ca`` model that signs the
  generated certificates;
- ``blueprint_cert``, an optional ``ForeignKey`` to the ``pki.Cert`` model
  whose non-unique properties are copied to every newly generated
  certificate.

.. image:: {static}/images/blog/gsoc26/x509-certificate-generator-templates/template-type.webp
    :alt: Adding a Certificate generator template in the Django admin, showing the Certificate Authority and Blueprint Certificate fields
    :align: center

Certificate generator templates always provision certificates
automatically, so their ``auto_cert`` value is implicitly enabled and is
not configurable. A set of validation rules protects the cryptographic
integrity of the templates:

- the CA is strictly required for ``cert`` templates;
- the blueprint must be signed by the selected CA;
- the blueprint must not already be assigned to a device;
- the CA and the blueprint must belong to the same organization as the
  template, or be shared.

When the template type is not ``cert``, the two certificate fields are
cleared automatically.

A new ``DeviceCertificate`` intermediate Many-To-Many model acts as a
strict relational bridge between the device configuration, the template
and the generated certificate. It stores a ``config`` and a ``template``
foreign key and a ``cert`` one-to-one relationship, and enforces a
``unique_together`` constraint on ``(config, template)`` so that a single
configuration can never generate conflicting certificates from the same
template.

Provisioning and Revocation Lifecycle
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Certificate generation follows the same lifecycle semantics as the
existing OpenVPN client certificates, but for standalone certificates:

- **Assignment generates a certificate.** When a certificate template is
  added to a device configuration, a ``DeviceCertificate`` relationship is
  created and an X.509 certificate is generated and signed in the same
  database transaction. The subject and extensions are copied from the
  blueprint certificate when one is provided, otherwise they fall back to
  the CA defaults, and the certificate's common name is built from the
  ``OPENWISP_CONTROLLER_COMMON_NAME_FORMAT`` setting, suffixed with a
  unique slug to prevent collisions.
- **Unassignment revokes the certificate.** When the template is removed
  from a configuration, the ``DeviceCertificate`` relationship is deleted
  and the underlying certificate is automatically revoked, adding it to
  the CA's Certificate Revocation List, so that relying parties that
  obtain and check current revocation information can reject the
  certificate.
- **Renewal regenerates the certificate.** Renewing a standalone
  certificate through the PKI endpoint regenerates the certificate and
  private key, and the dependency registered in
  ``Config.get_cache_dependencies()`` resolves the ``DeviceCertificate``
  relationship and updates the affected configuration status, so the
  device pulls the renewed certificate on its next check-in.

Because the private keys and certificates are stored and protected using
the existing `django-x509 <https://github.com/openwisp/django-x509>`_
mechanisms, no new encryption scheme, private key download endpoint or
permission model was introduced.

Custom Device Identification OIDs
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Every automatically generated certificate includes two custom ASN.1 Object
Identifiers that cryptographically bind it to the device:

- ``1.3.6.1.4.1.65901.1``: the MAC address of the device;
- ``1.3.6.1.4.1.65901.2``: the UUID of the device.

This allows external systems to uniquely and securely identify a device by
parsing its certificate. If the blueprint certificate already contains
either reserved OpenWISP hardware OID, the inherited value is replaced
with the value of the device using the template, so the certificate always
reflects the actual hardware.

.. image:: {static}/images/blog/gsoc26/x509-certificate-generator-templates/cert-gen.webp
    :alt: Generated X.509 certificate showing the custom OpenWISP device OIDs
    :align: center

Certificate Regeneration on Hardware Change
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Because the device name and MAC address are bound to the certificate
through the common name and the custom OIDs, any change to those hardware
properties would otherwise leave the device with a stale and inaccurate
identity. A background task now monitors the device's hostname and MAC
address and, when a change is detected on a device holding a
``DeviceCertificate``, revokes the outdated certificate and generates a
new one with the updated identity attributes. A ``generic_message``
notification is sent to the administrator once the regeneration is
complete, and the whole behavior can be disabled with the
``OPENWISP_CONTROLLER_REGENERATE_CERTS_ON_HARDWARE_CHANGE`` setting.

.. image:: {static}/images/blog/gsoc26/x509-certificate-generator-templates/notification.png
    :alt: OpenWISP notification reporting that a device's X.509 certificate was regenerated after its identity fields changed
    :align: center

Context Injection
~~~~~~~~~~~~~~~~~

To make the certificate usable, its payload is exposed to OpenWISP's
configuration engine as template variables. The ``Config.get_context()``
method was extended to iterate over the device certificates and build a
dictionary of variables namespaced with the 32-character hexadecimal UUID
of the template, which avoids collisions when multiple certificate
templates are assigned to the same device:

{% raw %}

- ``{{ cert_<template_uuid_hex>_pem }}``: the public certificate;
- ``{{ cert_<template_uuid_hex>_key }}``: the private key;
- ``{{ cert_<template_uuid_hex>_id }}``: the ID of the generated
  certificate;
- ``{{ cert_<template_uuid_hex>_path }}``: the path where the certificate
  file is installed on the device;
- ``{{ cert_<template_uuid_hex>_key_path }}``: the path where the private
  key file is installed on the device.

{% endraw %}

Administrators can reference these variables inside the JSON configuration
payload of any template, and OpenWISP replaces them with the exact
certificate and private key generated for that specific device.

Django Admin and REST API
~~~~~~~~~~~~~~~~~~~~~~~~~

The Django admin was updated so that certificate templates can actually be
configured: the new *Certificate generator* type appears in the type
dropdown, the *Certificate Authority* and *Blueprint Certificate* fields
are shown or hidden based on the selected type, and both foreign keys use
``raw_id_fields`` to stay scalable in large deployments. The blueprint
dropdown is filtered to show only unassigned, non-revoked certificates and
is scoped to the template's organization. The device admin gained a
dedicated certificate tab that lists the certificates generated for a
device, and links the template name to its detail page, opening in a new
tab.

Because changing the core parameters of a template that is already in use
would break the binding with the devices, an **Active Template Mutation
Lock** blocks changes to the type, organization, CA and blueprint of a
template while it is assigned to active devices. The lock is enforced both
in the admin and at the serializer level, so the same protection applies
to the API.

The certificate template type is fully supported by the existing REST API:
the ``type`` field accepts the ``cert`` enumeration, ``ca`` and
``blueprint_cert`` are writable on ``/api/v1/controller/template/``, and
patching the ``templates`` array of a device triggers the same creation
and revocation lifecycle described above. Requesting an already-assigned
or revoked certificate as a blueprint, or attempting a locked mutation,
returns a ``400 Bad Request``.

Current State
-------------

The complete work is available in `openwisp-controller
<https://github.com/openwisp/openwisp-controller>`_ and is documented,
both for the admin workflow and for the REST API. The project was
delivered incrementally through a series of focused issues and pull
requests, all of which were gathered in the implementation pull request
and consolidated into the final pull request:

- `Extend AbstractTemplate for X.509 Certificates
  <https://github.com/openwisp/openwisp-controller/issues/1356>`_
- `Introduce DeviceCertificate relational model
  <https://github.com/openwisp/openwisp-controller/issues/1377>`_
- `Update Django admin for Certificate templates
  <https://github.com/openwisp/openwisp-controller/issues/1357>`_
- `Implement certificate lifecycle management and integration
  <https://github.com/openwisp/openwisp-controller/issues/1358>`_
- `Implement auto-regeneration of certificates on device update
  <https://github.com/openwisp/openwisp-controller/issues/1359>`_
- `Expose certificate data as template variables
  <https://github.com/openwisp/openwisp-controller/issues/1360>`_
- `Integrate Certificate Templates into REST API
  <https://github.com/openwisp/openwisp-controller/issues/1361>`_
- `Documentation for X.509 Certificate generator templates
  <https://github.com/openwisp/openwisp-controller/issues/1362>`_
- `Show automatically generated x509 certificates in device admin
  <https://github.com/openwisp/openwisp-controller/issues/1410>`_
- `[feature] Added X.509 Certificate Generator Templates #1378
  <https://github.com/openwisp/openwisp-controller/pull/1378>`_
- `[feature] Added X.509 Certificate Generator Templates #1486
  <https://github.com/openwisp/openwisp-controller/pull/1486>`_

The dedicated documentation page is `X.509 Certificate Generator Templates
<https://openwisp.io/docs/dev/controller/user/certificate-templates.html>`_.

My Experience
-------------

Google Summer of Code with OpenWISP turned out to be an enriching
experience, and building something that spans cryptography, the database,
the configuration engine and the user interface all at once stretched me
in ways I had not anticipated. Watching an idea from the GSoC ideas page
become a fully working feature, more than five thousand lines of code
spread across four dozen files, is something I am genuinely proud of.

The most valuable part of the program was working alongside `Federico
Capoano (nemesifier) <https://github.com/nemesifier>`_ and `Aryaman
(Aryamanz29) <https://github.com/Aryamanz29>`_. Their reviews were
detailed and demanding in the best possible way, nudging me to reason
about multi-tenancy and organization scoping, transactional integrity
while generating certificates, the idempotency of background tasks, race
conditions when a CA or template changes while devices are still using it,
and the small user-experience details that decide whether a feature holds
up in production. I learned a great deal, and I am keenly aware of how
much is still left to learn.

Getting the certificate lifecycle right, keeping generated certificates in
sync with the device hardware, and keeping context injection
collision-free for devices that use multiple certificate templates were
the toughest challenges. Working through them taught me how to split a
large feature into pieces that can each be reviewed and merged on their
own, and how much it matters to write tests that exercise the real
database and signal paths instead of mocking them away.

Beyond the code, joining in the community's discussions was, once again,
something I truly enjoyed. I hope to remain involved and give back to the
community even more over the coming years.

What's Next?
------------

I plan to keep contributing actively to OpenWISP, working on bug fixes,
adding new enhancements and supporting new contributors in their
open-source journey. Now that I have an in-depth understanding of the
OpenWISP codebase, I am also interested in maintaining and evolving the
features I developed during GSoC.

One direction I would like to explore is making the standalone certificate
templates the underlying base for VPN client certificate management as
well. Today ``VpnClient`` still handles certificate creation, renewal and
revocation through its own tied-in logic and signal handlers, while the
new ``DeviceCertificate`` model provides a generalized framework for the
same operations. Keeping these two parallel paths means duplicated code
and the risk that fixes or improvements made to one never reach the other,
so the goal is to refactor ``VpnClient`` to reuse the standalone
infrastructure: moving the shared lifecycle into a common layer,
standardizing signal handlers and transaction atomicity, synchronizing CRL
updates across both implementations, and reusing the same renewal and
regeneration behavior on both sides. This work is tracked in
`openwisp-controller issue #1449
<https://github.com/openwisp/openwisp-controller/issues/1449>`_.
