---
layout: default
title : Talks
---
### Slides for talks I've given:

{% assign talks = site.talks | sort: 'date' | reverse  %}

{% for talk in talks %}

[{{ talk.title }}]({{ talk.url }})
==================================
<ul>
{{ talk.date | date: "%b %-d, %Y" }}  <br>
<b>{{ talk.short }}</b>
</ul>
{% endfor %}
