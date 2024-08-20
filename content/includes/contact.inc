{%
  macro contact_button( text,
  email="&#115;&#117;&#112;&#112;&#111;&#114;&#116;&#064;&#111;&#112;&#101;&#110;&#119;&#105;&#115;&#112;&#046;&#105;&#111;",
  css_classes="is-orange", icon="fa-envelope" )
-%}
  <a class="button with-text {{ css_classes }}" href="mailto:{{ email }}">
    <span class="fas fa-solid {{ icon }}"></span>
    <span>{{ text }}</span>
  </a>
{%- endmacro %}
