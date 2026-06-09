Aggressively Hunting Down Flaky CI Tests with AI
================================================

:date: 2026-06-08
:author: Federico Capoano
:tags: testing, ci, devops, ai
:category: news
:lang: en
:image_url: https://openwisp.org/images/blog/flaky-tests/flaky-tests-header.svg
:image_width: 1200
:image_height: 400

.. image:: {static}/images/blog/flaky-tests/flaky-tests-header.svg
    :alt: AI-assisted debugging of a flaky CI crash

If you have ever contributed to OpenWISP, you have probably met flaky CI.
A test passes on your machine, fails on CI, then passes again when you
re-run the job. Most OpenWISP modules are Django applications with
Selenium browser tests, and over time those intermittent failures became
more than a minor annoyance: red builds that were green a minute later,
contributors re-running jobs to unblock their pull requests, and
maintainers learning to double-check whether a red build was real or just
another ghost.

A self-healing bot, and the debt it hid
---------------------------------------

.. image:: {static}/images/blog/flaky-tests/ci-failure-bot-restarts-flaky-ci-runs.png
    :alt: openwisp-companion: The CI is failing due to transient infrastructure issues (not related to your code). I have restarted the failed jobs automatically (1/3).

To stop flaky runs from blocking everyone, I asked `Sarthak Tyagi
<https://github.com/stktyagi>`_ to help me build a small safety net into
our shared tooling: a reusable GitHub Actions workflow in
**openwisp-utils** that inspects a failed run, offers recommendations for
potential fixes, recognizes the signatures of known flaky failures, and
automatically restarts the failed build. You can read about it in the docs
for the `automated CI failure bot
<https://openwisp.io/docs/dev/utils/developer/reusable-github-utils.html#automated-ci-failure-bot>`_.

The bot kept the pipeline moving and saved us a lot of manual re-runs. But
it treated the symptom, not the disease. The real bugs were still there,
scattered across several modules, and we never found the time to chase
them down. Breathing room is useful, but if you never come back to the
root cause it quietly turns into debt.

The process I used
------------------

.. image:: {static}/images/blog/flaky-tests/agent-debugging-loop.svg
    :alt: Diagram of the supervised AI debugging loop: CI failures become a report, fixes are tested locally and on GitHub Actions, and human review steers the next iteration.

So I decided to use an AI coding agent as a tireless assistant on a
machine with cores to spare. I was still skeptical. A few months earlier I
had tried an AI agent on exactly this kind of debugging and it had been
useless: confidently wrong, eager to chase the wrong clue, and unable to
hold a long investigation together. The tools had improved since then, and
so had my prompting, but before betting on the hardest bug I wanted proof
that the approach could work at all.

The useful part was not that the agent had some special insight. I made it
do the repetitive work I would have done myself: read failed CI logs,
compare patterns, try fixes, and run the tests again. Doing that manually
would have taken me at least a full day of focused work. Instead, I used
Claude Code with Opus 4.8 in high-effort mode and kept it working with
minimal supervision while I was busy with other things.

The process looked roughly like this:

1. Fetch the output of flaky CI builds that had failed and then been
   restarted by the CI failure bot.
2. Analyze those logs, identify the most common failures, and look for
   possible solutions to each one.
3. Write the findings into a local Markdown report that I could inspect.
4. Start with the low-hanging fruit from that report.
5. Keep running tests locally until the agent could show that a change
   really reduced the flaky failures it was targeting.
6. Push branches to GitHub and keep restarting GitHub Actions CI jobs, so
   we could compare local stress runs with repeated CI runs instead of
   trusting just one environment.
7. Address feedback from `CodeRabbit <https://www.coderabbit.ai/>`_.
8. Update the report whenever the agent found another recurring failure
   pattern.
9. Treat a targeted change as invalid if the same flaky failure kept
   showing up, then send the agent back to look for a different solution.
10. Read the updated report from time to time, give the agent hints, and
    steer priorities or methodology when it started drifting.

The loop was simple: collect failures, rank them, try the easiest useful
fix, prove whether it helped, update the report, and keep iterating until
the flaky errors came down.

Later, I used `opencode <https://opencode.ai/>`_ with GPT 5.5 in
medium-effort mode to clean up the solution, polish the code, and make the
comments more human-readable.

Earning trust on an easier target
---------------------------------

.. image:: {static}/images/blog/flaky-tests/controller-first-pr-flaky-tests.png
    :alt: [fix] Fixed several flaky tests causing intermittent CI failures

I started with `openwisp-controller
<https://github.com/openwisp/openwisp-controller/pull/1392>`_, where the
flaky failures were annoying but more tractable, and left the scariest
crash alone for the moment.

It went better than expected. I did not hand the problem over and wait for
an answer. I used the agent to do the time-consuming part of my own normal
debugging loop: keep running tests, inspect failures, try small changes,
and verify whether each change really moved the needle. That process fixed
several flaky tests and, more interestingly, exposed a real bug behind
some of them: background tasks were resurrecting already-deleted rows with
a stray ``INSERT``. The resulting ``FOREIGN KEY`` error could corrupt the
SQLite test state and leave the Selenium browser waiting for a page that
would never recover. The same work also moved session storage out of the
shared cache, a test fix that doubled as production hardening.

.. image:: {static}/images/blog/flaky-tests/flaky-claude.png
    :alt: flaky.md

Nothing about it was magic. What changed since my earlier attempt was that
**I treated the agent like a very patient pair of hands on a spare
machine, not like an oracle**. I kept pushing it through the same loop I
would have followed myself: reproduce, change one thing, run it again,
disprove the dead end, keep going. The agent was useful because it could
stay inside that loop for hours while I checked in, corrected course, and
kept working on other things.

That success is what made me brave enough to point the same setup at
another case I had been quietly ignoring: a group of frequent and brutal
flaky failures in `openwisp-monitoring
<https://github.com/openwisp/openwisp-monitoring/pull/813>`_. The first
set of fixes there was not the crash yet. It was a cluster of InfluxDB UDP
timing races in the timeseries tests. The UDP listener flushes writes
asynchronously, so data written by a test was not always queryable when
the same test read it back. The fixes were to stop trusting fixed sleeps,
poll until reads became stable, enlarge the test UDP read buffer so bursts
were not dropped, wait for wifi-client data before running checks, and
exclude a few read-after-write assertions from the UDP run when the test
could not insert a reliable wait.

A nasty segmentation fault that seemed unfixable
------------------------------------------------

.. image:: {static}/images/blog/flaky-tests/double-free.png
    :alt: double free or corruption failure

While working on the fixes for the flaky tests in OpenWISP Monitoring, a
familiar failure showed up again: ``double free or corruption`` followed
by ``Fatal Python error: Segmentation fault``.

This was not an assertion, a timeout, or a Selenium click that missed its
target. It was a hard C-level crash. It killed the live test server
mid-run and dragged the entire Selenium test suite down with it. It
happened maybe once in fourteen runs, on some jobs and not others. Exactly
the kind of bug that is almost impossible to pin down by re-reading logs.

I had seen this many times before and had already tried to debug it, but I
never reached a useful conclusion quickly enough. Other work kept taking
priority, so I had to let it go. This time I was galvanized by the recent
wins and had more spare tokens to burn at night, so I decided to leave the
agent running after hours.

Brute force, then analysis
--------------------------

.. image:: {static}/images/blog/flaky-tests/htop-during-flaky-tests-bruteforce.png
    :alt: htop during flaky test brute force

While I was relaxing, watching TV series, and playing games, my laptop fan
started going crazy. The ``htop`` screenshot above shows the agent using
my laptop's hardware resources at full capacity.

The agent was doing the heavy work for me: brute-forcing and analyzing
each run. Under my direction, it helped build a parallel test harness that
hammered the Selenium suite over and over, isolated each worker so they
would not clobber one another, and stood up a dedicated Python 3.13
toolchain to match the CI environment.

Here's a sample test script created during this process:

.. code-block:: bash

    #!/bin/bash
    # Reproduce the SQLite double-free in TestDashboardMap locally.
    cd /home/nemesis/Code/ow-oss/openwisp-monitoring || exit 1
    OUT=/home/nemesis/Code/ow-oss/openwisp-monitoring/repro_results.md
    SIG='double free|free\(\):|corruption|Fatal Python error|Segmentation fault|core dumped'
    export SELENIUM_HEADLESS=1 DJANGO_SETTINGS_MODULE=openwisp2.settings
    TARGET=openwisp_monitoring.tests.test_selenium.TestDashboardMap
    ITERS="${1:-25}"
    : > "$OUT"
    echo "# Local repro - $ITERS iters - $(date -u +'%H:%M:%S') UTC" >> "$OUT"
    for n in $(seq 1 "$ITERS"); do
        rm -f tests/openwisp-monitoring-tests.db* tests/openwisp-monitoring.db* 2>/dev/null
        log=$(timeout 600 python tests/manage.py test "$TARGET" --noinput 2>&1)
        c=$(printf '%s' "$log" | grep -ciE "$SIG")
        ok=$(printf '%s' "$log" | grep -cE '^OK$')
        echo "- iter $n: crash=$c ok=$ok $(date -u +%H:%M:%S)" >> "$OUT"
        if [ "$c" -gt 0 ]; then
            echo "  >>> CRASH at iter $n <<<" >> "$OUT"
            printf '%s' "$log" | grep -iE "$SIG" | sed -E 's/^/    /' >> "$OUT"
            break
        fi
    done
    echo "DONE $(date -u +'%H:%M:%S') UTC" >> "$OUT"

The advantage was not creativity. It was that the machine could keep doing
the boring part while I supervised the direction of the work. After a few
hundred runs we finally had a real, measurable signal: the crash
reproduced about **7% of the time, and only on Python 3.13**. Every Python
3.10 to 3.12 run was clean.

That reproduction was the turning point. With it, the thread dumps stopped
looking random. Two threads were touching SQLite connections at the same
instant: one opening a connection, one closing another.

There were false starts worth admitting. A fix that throttled the ASGI
server's thread pool turned out to be a no-op, because the test server
quietly rebuilds its event loop and throws the setting away. Making
database connections persistent only moved the crash somewhere else. The
difference this time was throughput: every dead end could be disproven by
re-running the harness many times, not by hoping, and I did not have to
spend the whole day babysitting each run myself.

The real culprit behind "double free or corruption"
---------------------------------------------------

.. image:: {static}/images/blog/flaky-tests/sqlite-spatialite-race.svg
    :alt: Diagram showing a race between SpatiaLite library lookup and SQLite connection cleanup, fixed by memoizing the lookup and serializing connection open and close.

The cause was hiding in GeoDjango. Django's SpatiaLite backend calls
``ctypes.util.find_library("spatialite")`` while building the SpatiaLite
library paths for new connections. On Linux, ``find_library`` may fork an
``ldconfig`` subprocess. Doing that repeatedly in a multi-threaded live
server is a bad combination: one thread can be forking while another
thread is in the middle of SQLite connection cleanup, deep enough in C
code that a bad interleaving shows up as heap corruption rather than a
friendly Python traceback.

Most of the time you get away with it. Python 3.13 changed the timing just
enough to turn "most of the time" into an intermittent double free.

The fix is small and a little boring, which is the best kind. In our
SpatiaLite backend wrapper, we memoize the library lookup so the
subprocess is not forked over and over. In the Selenium test mixin, we
serialize connection open and close around Django's
``BaseDatabaseWrapper.connect`` and ``BaseDatabaseWrapper._close`` when
the default backend is SQLite or SpatiaLite. That makes the connection
lifecycle process-wide and boringly serialized for the duration of the
live-server tests.

With both pieces in place, the crash rate went from 7% to **zero across
more than ninety runs**, and then held green across repeated CI reruns of
the shared fix.

The best part: it is shared
---------------------------

.. image:: {static}/images/blog/flaky-tests/openwisp-utils-pr.png
    :alt: [tests] Avoid flaky SQLite crashes in live-server tests

The final fix did not land in openwisp-monitoring. It landed in
`openwisp-utils <https://github.com/openwisp/openwisp-utils/pull/699>`_,
our shared library, in the SpatiaLite backend wrapper and the Selenium
test base class. That means every OpenWISP module that uses GeoDjango and
browser tests gets the fix at once.

The same investigation also cleaned up a separate flaky test caused by an
unrelated InfluxDB timing race. The clue was a dropped data point averaged
over three samples instead of four, off by exactly one third. That is the
kind of detail I could have found manually, but only by spending more time
staring at CI logs and test output. Having the agent collect and summarize
those patterns made it easier for me to notice what mattered.

There are two takeaways for me:

1. The self-healing bot bought us time, but time can hide debt, so it pays
   to come back and fix the cause.
2. For deep, tedious, reproduce-it-a-thousand-times debugging, an AI agent
   with a machine to brute-force on can be a genuine force multiplier when
   a human keeps directing the investigation. It did not replace the
   debugging process. It let me run that process in the background with
   much less supervision. With that setup, I got through in a couple of
   days what we had been postponing for years.

The upstream angle is still open. We should report it once we have a small
reproducer that does not depend on the whole OpenWISP test suite.
Depending on what that reproducer shows, the right place may be Django,
CPython, or the lower-level SQLite/SpatiaLite stack. Until then, the
important part is that our shared test utilities no longer leave
contributors at the mercy of a random C-level crash.
