{%
  macro partners( text, customers=True, contributors=True, oss_funding=True,
  more_button=False, more_button_text="More Success Stories", section_classes="" )
-%}
  <section
    class="section partners grayscale{% if section_classes %}{{ " " + section_classes }}{% endif %}"
  >
    <div class="container is-max-widescreen has-text-centered">
      <p class="has-text-weight-medium">{{ text }}</p>
      <p class="pt-4">
        <a href="{filename}partners.html">
          {% if customers %}
            <img
              src="{static}/images/partners/ubisoft.svg"
              class="ubisoft"
              alt="Ubisoft"
              title="Ubisoft"
              width="172"
              height="55"
            />
            <img
              src="{static}/images/partners/unidata.webp"
              class="unidata"
              alt="Unidata"
              title="Unidata"
              width="171"
              height="60"
            />
            <img
              src="{static}/images/partners/csi-piemonte.webp"
              class="csi"
              alt="CSI Piemonte, Your Digital Partner"
              title="CSI Piemonte, Your Digital Partner"
              width="183"
              height="60"
            />
            <img
              src="{static}/images/partners/insiel.webp"
              class="insiel"
              alt="Insiel"
              title="Insiel"
              width="194"
              height="40"
            />
            <img
              src="{static}/images/partners/uniurb.svg"
              class="uniurb"
              alt="Università degli Studi di Urbino CarloBo"
              title="Università degli Studi di Urbino CarloBo"
              width="167"
              height="80"
            />
            <img
              src="{static}/images/partners/wayru.svg"
              class="wayru"
              alt="Wayru"
              title="Wayru"
              width="171"
              height="55"
            />
            <img
              src="{static}/images/partners/ltech.webp"
              class="ltech"
              alt="Ltech"
              title="Ltech"
              width="171"
              height="60"
            />
            <img
              src="{static}/images/partners/umoja.webp"
              class="umoja"
              alt="Umoja"
              title="Umoja"
              width="142"
              height="60"
            />
            <img
              src="{static}/images/partners/a2a.svg"
              class="a2a"
              alt="A2A"
              title="A2A"
              width="171"
              height="60"
            />
          {% endif %}
          {% if contributors %}
            <img
              src="{static}/images/partners/tdt.svg"
              class="tdt"
              alt="TDT Your Experts in Telecommunication"
              title="TDT"
              width="218"
              height="42"
            />
          {% endif %}
          {% if oss_funding %}
            <img
              src="{static}/images/partners/gsoc.webp"
              class="gsoc"
              alt="Google Summer of Code"
              title="Google Summer of Code"
              width="376"
              height="60"
            />
            <img
              src="{static}/images/partners/internews.svg"
              class="internews"
              alt="Internews"
              title="Internews"
              width="200"
              height="60"
            />
            <img
              src="{static}/images/partners/ura.svg"
              class="ura"
              alt="Ura"
              title="Ura Design"
              width="152"
              height="54"
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
