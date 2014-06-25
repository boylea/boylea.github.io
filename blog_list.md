---
layout: default
title : sparkle blog
---
Blogness:


{% for post in site.posts %}

[{{ post.title }}]({{ post.url }})
==================================
<ul>
{{ post.date | date_to_string }}  <br>
<b>{{ post.short }}</b>
</ul>
{% endfor %}
