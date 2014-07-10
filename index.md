---
layout: default
title : Brains!
---

Coding With Ninjas
-------------------

Hello Interwebbers!

My name is Amy Boyle, and I do software development for fun and profit. My current work is writing code for neuroscience research.

You can find me on [github](https://github.com/boylea) 

The purpose of this blog is mostly for me to write down stuff I think is cool and/or don't want to forget.

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>