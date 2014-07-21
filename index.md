---
layout: default
title : Brains!
---

Coding With Ninjas
-------------------

Stuff I've done or want to share.

<img src="images/ninjaslaptop.jpg" alt="ninjas" style="width: 400px;"/>

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>