{%
  macro github_activity(
    posts=5,
    load_more=False,
    add_page=False,
    top_spacing=4,
    title_classes="is-size-3 is-size-4-mobile"
  )
-%}
  <section
    class="section has-text-centered mt-{{ top_spacing }} pt-{{ top_spacing }} pb-4"
  >
    <div class="container">
      <h2 class="title is-spaced {{ title_classes }}">
        Recent
        <span class="has-text-primary">Activity</span>
      </h2>
      <p class="subtitle is-size-5 is-spaced">
        Commits, pull requests, issues and other recent activity from the
        <a href="https://github.com/openwisp" target="_blank">@openwisp</a>
        Github feed.
      </p>
      <p class="button-container">
        <small class="is-size-6"
          >Stay up to date by following our social media profiles!</small
        >
        <br />
        <a
          href="https://www.linkedin.com/company/openwisp"
          title="OpenWISP On LinkedIn"
          target="_blank"
          class="button is-white"
        >
          <span class="fas fa-brands fa-linkedin"></span>
        </a>
        <a
          href="https://x.com/openwisp"
          title="@OpenWISP on X.com"
          target="_blank"
          class="button is-white"
        >
          <span class="fas fa-brands fa-x-twitter"></span>
        </a>
        <a
          href="https://facebook.com/openwisp"
          title="OpenWISP on Facebook"
          target="_blank"
          class="button is-white"
        >
          <span class="fas fa-brands fa-facebook"></span>
        </a>
        <a
          href="https://github.com/openwisp"
          title="OpenWISP on Github"
          target="_blank"
          class="button is-white"
        >
          <span class="fas fa-brands fa-github"></span>
        </a>
      </p>
    </div>
  </section>

  <section class="section pt-4 pb-4 mb-4">
    <div class="container content">
      <div class="feed feed-container">
        <p>Loading recent activity...</p>
      </div>
      {% if not load_more %}
        <p class="has-text-centered">
          <a
            class="button with-text is-orange is-inverted"
            href="{{ SITEURL }}/activity/"
          >
            <span class="fas fa-solid fa-plus"></span>
            <span>More Recent Activity</span>
          </a>
        </p>
      {% endif %}
    </div>
  </section>

  <script src="{{ SITEURL }}/theme/js/activity.min.js?v=1"></script>
  <!-- prettier-ignore-start -->
  <script>
    $(document).ready(function () {
      createActivityFeed({
        posts: {{ posts }},
        loadMore: {{ load_more|lower }},
        addPage: {{ add_page|lower }},
        callback: closeLoading
      });
    });
    {% if load_more %}
      $(document).ajaxStart(showLoading);
      $(document).ajaxStop(closeLoading);
    {% endif %}
  </script>
  <!-- prettier-ignore-end -->
{%- endmacro %}
