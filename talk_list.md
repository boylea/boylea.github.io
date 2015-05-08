---
layout: default
title : Talks
---
###Slides for talks I've given:

{% for talk in site.talks %}

[{{ talk.title }}]({{ talk.url }})
==================================
<ul>
{{ talk.date | date: "%b %-d, %Y" }}  <br>
<b>{{ talk.short }}</b>
</ul>
{% endfor %}
