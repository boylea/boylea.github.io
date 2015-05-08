---
layout: default
title : Brains!
---

Coding With Ninjas
-------------------

Stuff I've done or want to share.

<img src="images/ninjaslaptop.jpg" alt="ninjas" style="width: 400px;" title="An eager pack of problem-solving ninjas"/>

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