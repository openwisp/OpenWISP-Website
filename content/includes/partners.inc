{%
  macro partners( text, customers=True, contributors=True, oss_funding=True,
  more_button=False, more_button_text="More Success Stories", section_classes="" )
-%}
  <section
    class="section partners grayscale{% if section_classes %}{{ " " + section_classes }}{% endif %}"
  >
    <div class="container is-max-widescreen has-text-centered">
      <p class="has-text-weight-medium">{{ text }}</p>
      <p>
        <a href="{{ SITEURL }}/partners/">
          {% if customers %}
            <img
              src="{{ SITEURL }}/theme/images/partners/ubisoft.svg"
              class="ubisoft"
              alt="Ubisoft"
              title="Ubisoft"
            />
            <img
              src="{{ SITEURL }}/theme/images/partners/csi-piemonte.png"
              class="csi"
              alt="CSI Piemonte, Your Digital Partner"
              ,
              title="CSI Piemonte, Your Digital Partner"
            />
            <img
              src="{{ SITEURL }}/theme/images/partners/insiel.png"
              class="insiel"
              alt="Insiel"
              title="Insiel"
            />
            <img
              src="{{ SITEURL }}/theme/images/partners/uniurb.svg"
              class="uniurb"
              alt="Università degli Studi di Urbino CarloBo"
              title="Università degli Studi di Urbino CarloBo"
            />
            <img
              src="{{ SITEURL }}/theme/images/partners/wayru.svg"
              class="wayru"
              alt="Wayru"
              title="Wayru"
            />
          {% endif %}
          {% if contributors %}
          {% endif %}
          {% if oss_funding %}
            <img
              src="{{ SITEURL }}/theme/images/partners/gsoc.png"
              class="gsoc"
              alt="Google Summer of Code"
              title="Google Summer of Code"
            />
            <img
              src="{{ SITEURL }}/theme/images/partners/internews.svg"
              class="internews"
              alt="Internews"
              title="Internews"
            />
            <img
              src="{{ SITEURL }}/theme/images/partners/ura.svg"
              class="ura"
              alt="Ura"
              title="Ura Design"
            />
          {% endif %}
        </a>
      </p>
      {% if more_button %}
        <p class="button-container">
          <a class="button with-text" href="{{ SITEURL }}/partners/">
            <span class="fas fa-solid fa-plus"></span>
            <span>{{ more_button_text }}</span>
          </a>
        </p>
      {% endif %}
    </div>
  </section>
{%- endmacro %}
