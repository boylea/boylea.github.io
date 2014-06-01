---
layout: default
title : Brains!
---
Bicycles and Glitter
---------------------

Hello Interwebbers!

My name is Amy Boyle, and I do software development for fun and profit. My current work is writing code for neuroscience research. 

You can find me on <a href="https://github.com/boylea">github</a> 

I plan to create blog posts, but for now enjoy these place holders:

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>