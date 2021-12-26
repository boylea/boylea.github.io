---
layout: default
title : Brains!
---

Another software engineer's static site
-------------------

Stuff I've done or want to share.


Blog posts:

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

Talks:
<ul>
  {% for talk in site.talks %}
    <li>
      <a href="{{ talk.url }}">{{ talk.title }}</a>
    </li>
  {% endfor %}
</ul>