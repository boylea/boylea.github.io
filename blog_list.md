---
layout: default
title : sparkle blog
---
###Listen in on the ninja chat:


{% for post in site.posts %}

[{{ post.title }}]({{ post.url }})
==================================
<ul>
{{ post.date | date_to_string }}  <br>
<b>{{ post.short }}</b>
</ul>
{% endfor %}
