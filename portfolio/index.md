---
layout: default
title: Portfolio · Cole J.
---

# Welcome!

Check out any of the pages in the sidebar to get started.

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>