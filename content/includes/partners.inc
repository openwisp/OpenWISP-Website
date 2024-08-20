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
        <a href="{filename}partners.html">
          {% if customers %}
            <img
              src="{static}/images/partners/ubisoft.svg"
              class="ubisoft"
              alt="Ubisoft"
              title="Ubisoft"
            />
            <img
              src="{static}/images/partners/csi-piemonte.png"
              class="csi"
              alt="CSI Piemonte, Your Digital Partner"
              ,
              title="CSI Piemonte, Your Digital Partner"
            />
            <img
              src="{static}/images/partners/insiel.png"
              class="insiel"
              alt="Insiel"
              title="Insiel"
            />
            <img
              src="{static}/images/partners/uniurb.svg"
              class="uniurb"
              alt="Università degli Studi di Urbino CarloBo"
              title="Università degli Studi di Urbino CarloBo"
            />
            <img
              src="{static}/images/partners/wayru.svg"
              class="wayru"
              alt="Wayru"
              title="Wayru"
            />
          {% endif %}
          {% if contributors %}
          {% endif %}
          {% if oss_funding %}
            <img
              src="{static}/images/partners/gsoc.png"
              class="gsoc"
              alt="Google Summer of Code"
              title="Google Summer of Code"
            />
            <img
              src="{static}/images/partners/internews.svg"
              class="internews"
              alt="Internews"
              title="Internews"
            />
            <img
              src="{static}/images/partners/ura.svg"
              class="ura"
              alt="Ura"
              title="Ura Design"
            />
          {% endif %}
        </a>
      </p>
      {% if more_button %}
        <p class="button-container">
          <a class="button with-text" href="{filename}partners.html">
            <span class="fas fa-solid fa-plus"></span>
            <span>{{ more_button_text }}</span>
          </a>
        </p>
      {% endif %}
    </div>
  </section>
{%- endmacro %}
