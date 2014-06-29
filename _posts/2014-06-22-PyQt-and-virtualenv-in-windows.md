---
layout: default
short: PyQt with virtualenv in windows
comments: True
---

Installing Qt python bindings in virtualenv (Windows)
=====================================================
Because installing some python packages from source on windows is painful, I decided to install from binaries. This simplifies the process quite a bit.

The two strategies I outline here may, if fact, be used for many packages for which there is an installer available

Christophe Gohlke mainatains a [webpage](http://www.lfd.uci.edu/~gohlke/pythonlibs) that lists the binaries for many python libraries, particularly ones that scientific applications. You can use this site to Download the installers for PyQt or PySide.

PyQt
-----
Download the installer for you platform.

Run the installer, but instead of installing to your global site-packages folder install to some other location. I made a separate folder under my home folder to hold binaries that I want to use in virtualenv.

Then just copy the files that were installed into your desired virtualenv's site-packages directory.

That's it! You should be able to activate your virtualenv and run

`python -c "from PyQt4 import QtCore"`

and not receive an error.

PySide
------
For PySide there is also another (slighly easier) option.

Download the installer for you platform.

With your virtaulenv active, run easy install on the installer executable, e.g.:

`easy_install PySide-1.2.2.win32-py2.7.exe`

That Should do it! Check the installation by running

`python -c "from PyQt4 import QtCore"`

without receiving an error.