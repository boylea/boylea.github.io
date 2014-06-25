---
layout: default
short: How to make PyQt/PySide play nice with virtualenv
---
Installing Qt python bindings in virtualenv (Linux)
====================================================  

I will first note that the internet tells me you can install PyQt in Ubuntu simply via  


`sudo apt-get install python-sip python-qt4`  

However, if you want to be using PyQt or PySide in a virtualenv, like a good pythonista, you can follow these instructions to build from source. These instructions apply to python 2.7. I have done this with Ubuntu and Fedora, and will specify different commands for where they differ, otherwise the instructions will apply to both. These instructions were written primarily for myself, if you have another linux distro the overall strategy here will apply, and you could likely adapt these instructions to work for you.

How to install PyQt4 on virtualenv
-----------------------------------

It will be necessary to have certain packages installed, in order to build Sip and PyQt. I already had some of these packages installed, but I believe these are the correct prerequisites. If you get errors later in these instructions that report something as missing/couldn't find, you probably need a library I missed here. If you find any of these, please feel free to email me and I will add it here.

Ubuntu:  
`sudo apt-get install python2.7-dev libxext-dev qt4-dev-tools build-essential`

Fedora:  
`sudo yum install gcc gcc-c++ python-devel qt-devel`

After installing the dependent packages, the first step is to install sip, which isn't on pip either.

You can download the source packages for sip through the [link](http://www.riverbankcomputing.com/software/sip/download) on the pyqt website - OR - like the command line ninja you are, you can simply run

`wget -O sip-4.16.1.tar.gz http://sourceforge.net/projects/pyqt/files/sip/sip-4.16.1/sip-4.16.1.tar.gz`

and the sip tar ball will be downloaded to your current directory. Unpack the sources to a folder anywhere -- you will use these sources to install sip anytime you make a new virtualenv that requires PyQt. To unpack:

`tar -xvzf sip-4.16.1.tar.gz`

Make sure you have the virtualenv you wish to install to active (e.g. `workon myenv`, if using virtualenvwrapper). As a side note, if you are not using virtualenvwrapper -- it's great (`pip install virtualenvwrapper`)

In the unpacked sources root folder run the configure file:
    
`cd sip-4.16.1`  
`python configure.py`

This should report the folders of your virtualenv that sip will get installed to.

Then, while still in the unpacked sip folder, run the two commands:

`make`  
`sudo make install`

If no errors have occured, hooray! Now we can move on to PyQt itself

Download the PyQt Source from the [webs](http://www.riverbankcomputing.com/software/pyqt/download) or via command line, and unpack:

`wget -O PyQt-x11-gpl-4.11.tar.gz http://sourceforge.net/projects/pyqt/files/PyQt4/PyQt-4.11/PyQt-x11-gpl-4.11.tar.gz`  
`tar -xvzf PyQt-x11-gpl-4.11.tar.gz`

As instructed in the README, attempting to run `python configure-ng.py`, will tell you that it needs to know where qmake is. Do what it says, i.e.:

`cd PyQt-x11-gpl-4.11`  
`python configure-ng.py -q /usr/bin/qmake-qt4`

Now, again run :

`make`  
`sudo make install`

This make take a few minutes to install. To check if you were successful, run `python -c "from PyQt4 import QtCore"`, if you do not receive an import error, you are all good to go!

Anytime you want to add pyqt to a new virtualenv, just repeat these steps, starting with `python configure.py` with the target env active.


PySide Installation Instructions:
---------------------------------

Prerequisites:

Ubunutu:  
`sudo apt-get install build-essential git cmake libqt4-dev libphonon-dev python2.7-dev libxml2-dev libxslt1-dev qtmobility-dev`

Fedora:  
`sudo yum install cmake qt-devel qt-webkit-devel libxml2-devel libxslt-devel python-devel rpmdevtools gcc gcc-c++ make`

download source:

`wget https://pypi.python.org/packages/source/P/PySide/PySide-1.2.1.tar.gz`

unpack somewhere:

`tar -xvzf PySide-1.2.1.tar.gz`  
`cd PySide-1.2.1`

Build the egg binary distribution:

`python setup.py bdist_egg --qmake=/usr/bin/qmake-qt4`

cd into your virtualenv's directory and run:

`easy_install .../dist/PySide-1.2.1-py2.7-linux-x86_64.egg`
`python .../pyside_postinstall.py -install`

(The ellipses are the location of the pyside sources folder you unpacked and built from)

To check if you were successful, run `python -c "from PySide import QtCore"`, if you do not receive an import error, you are all good to go.

To install PySide to another virtualenv, simply repeat the last step.

![Meow](http://placekitten.com/g/200/300)
