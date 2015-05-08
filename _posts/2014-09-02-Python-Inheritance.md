---
layout: default
short: Multiple Inheritance in Python
comments: True
---

Multiple Inheritance Minefield
===============================

So I thought I knew how to use inheritance in Python properly. However, when I had a need to use multiple inheritance, I found I did not, in fact, know what was happening. Nothing here is new, it is all in the python docs, and if you are looking for a good explanation of multi class inheritance in python I found [this account][supersuper] well-written and useful. ...But then I also found [a detractor][harmful], or [two][harmful2]. This post is basically me digesting all the posts I read about inheritance in python, to convince myself I know what I am doing. Warning, this post is a bit of an untamed beast.

When subclassing a class in python, it is almost always necessary to call the constructor of the super class, this can be done with the following:

{% highlight python %} 
class MyClass(BaseClass):
    def __init__(self):
        super(MyClass, self).__init__()
{% endhighlight %}

and in Python 3 you can even just write:

{% highlight python %} 
class MyClass(BaseClass):
    def __init__(self):
        super()
{% endhighlight %}

Also, the constructor of the base class can be called directly:

{% highlight python %} 
class MyClass(BaseClass):
    def __init__(self):
        BaseClass.__init__(self)
{% endhighlight %}

While looking up code on the internet, I have seen plenty examples of both.

I had assumed the above statements were equivalent, since, of course, the super class of MyClass is BaseClass anyways. And for most of my experience, they were. This is because like any good Pythonista, I had avoided multiple inheritance, treating it as a tool only to be used when there are no other reasonable solutions.

In truth, super is not calling the current class's super class, it is calling the next class in the Method Resolution Order (MRO). When you have multiple inheritance, this is simply the chain of inheritance from the final subclass you have created all the way up to object.

Also, this is assuming new style classes, which came in under Python 2.2. Although the use of new-style classes is now considered standard, old-style is still default for backwards-compatibility reasons. Attempting to use super with old-style classes will meet you with an error. I ran into this while trying to subclass some third-party code.

Next method invocation, not super class
----------------------------------------

Looking at the following code:

{% highlight python %} 
class AClass(object):
    def __init__(self):
        super(AClass, self).__init__()
{% endhighlight %}

I would have thought the super class superfluous. Since we are inheriting from object, which is the root class of inheritance in python, it will effectively do nothing. WRONG!

In multiple inheritance (new-style classes), Python assembles the MRO upon declaration of a new class will iterate through this list each time super() is called. So, if AClass is used as a super class in a multiple inheritance situation, and there is a constructor method after AClass's in the MRO, whether or not it gets executed depends on whether that super method was called in AClass's __init__ method.

Here is a simple set of classes that uses multiple inheritance:

{% highlight python %} 
class A(object):
    def __init__(self):
        print "init A"
        super(A, self).__init__()

class B(object):
    def __init__(self):
        print "init B"
        super(B, self).__init__()

class C(A):
    def __init__(self):
        print "init C"
        super(C, self).__init__()

class D(C, B):
    def __init__(self):
        print "init D"
        super(D, self).__init__()

if __name__ == '__main__':
    D()
{% endhighlight %}

The output is as expected:

    init D
    init C
    init A
    init B


The super class of A is object, and [object.__init__()][objectsource] doesn't do anything* anyways. So we should be able to leave this out, right? Well...


{% highlight python %} 
class A(object):
    def __init__(self):
        print "init A"

class B(object):
    def __init__(self):
        print "init B"

class C(A):
    def __init__(self):
        print "init C"
        super(C, self).__init__()

class D(C, B):
    def __init__(self):
        print "init D"
        super(D, self).__init__()

if __name__ == '__main__':
    D()
{% endhighlight %}

    init D
    init C
    init A

What happened to `init B`? When the constructor for D gets called it uses the MRO to find which __init__() method it should call, which, in this case, is D itself. After that, to get the other __init__ methods to execute, super needs to be called, in each successive __init__ method. Alternatively, the MRO can be subverted by calling __init__ explicitly, as mentioned at the start up this post. In single inheritance situations, the difference turns out to be inconsequential. 

However, perhaps you didn't think that class you wrote would be used in a multiple inheritance situation, but later that changed. Even more critically, if you are writing a library that other people will use, it could result in unexpected behavior. For example, if someone wrote some library code without the use of super:

{% highlight python %} 
class A(object):
    def __init__(self):
        pass

class C(A):
    def __init__(self):
        A.__init__(self)
{% endhighlight %}

And you have your own class B that you want to mixin, which you have diligently used super to connect your class hierarchy:

{% highlight python %} 
class B(object):
    def __init__(self):
        super(B, self).__init__()

class D(C, B):
    def __init__(self):
        super(D, self).__init__()

if __name__ == '__main__':
    D()
{% endhighlight %}


You would need to dive into the source code for the library to see that the author didn't call super for class A, and thus your mixin class never got initialized.

<!-- each call to super executes the next __init__ method until either the MRO runs out, or an __init__ method returns without calling super. -->
Mo classes, mo problems
------------------------

The inverse of the above situation is also true. Say you are using as a subclass, a class that does call super in the constructor:

{% highlight python %} 
class A(object):
    def __init__(self):
        print "init A"
        super(A, self).__init__()

class C(A):
    def __init__(self):
        print "init C"
        super(C, self).__init()
{% endhighlight %}

And you have your own class B that you want to mixin, but you explicitly call the super class's constructor via `__init__` instead:

{% highlight python %} 
class B(object):
    def __init__(self):
        print "init B"

class D(C, B):
    def __init__(self):
        print "init D"
        C.__init__()
        B.__init__()

if __name__ == '__main__':
    D()
{% endhighlight %}

    init D
    init C
    init A
    init B
    init B

Class B's constructor got called twice, once by A class's constructor executing super (B was next in the MRO), and once explicitly in the constructor for D.

How the MRO came to be
------------------------

In the old-style classes the MRO was the simple left-right depth first order. They are still the default for python 2.x, for backwards compatibility reasons. All the examples in this post assume new style classes.

Basically, since 2.3, Python has used the [C3 algorithm][C3] to determine the MRO upon class declaration. This is to avoid the perils in the old method with diamond inheritance, and to have a monotonic algorithm. Luckily, the class hierarchies I have to work with aren't too crazy, the only base class shared between the multiply inherited subclasses is object itself. I know that object will come last in the MRO, and subclasses will always precede their parent classes, so I don't have to get into understanding the details of how C3 works. Although, if you want to, you can [read about it][MRO] anyways
  
I found interesting Guido Van Rossum's account of [why the MRO is the way it is][MROhist].

So Let's just all be super
---------------------------

Really, you need to consistently use super, or use it not at all. However, this is not the end of the story, because if you use it *too* consistently you can still run into problems. The above examples all used the init method because since all objects have an init method that should be called on object initiation, so it is a common place where things go wrong. There is nothing special about the __init__ method with respect to inheritance and the MRO, it all applies the same to all methods in a class. So, for instance:


{% highlight python %} 
class A(object):
    def save(self):
        super(A, self).save()
        # do additional stuffs...

class B(object):
    def save(self):
        super(B, self).save()
        # do additional stuffs...

class C(A):
    def save(self):
        super(C, self).save()
        # do additional stuffs...

class D(C, B):
    pass

if __name__ == '__main__':
    D().save()
{% endhighlight %}

    ...
    AttributeError: 'super' object has no attribute 'save'

`object` does not have a save method, so we got an error when we called super and the next class in the MRO did not have the desired method.

Ok, so if we are going to use super, we need to follow some guidelines:

* If you are thinking of your two classes that you are multiply inheriting as a Base class and a mixin, the mixin should be on the left in the class declaration. This will make the MRO and calling super more sane, as it is like you are applying a modifying class on top of another class.
* Know what the last class in the MRO to define a certain method is. Do not call super in this method.
* If you are not the author of either the inherited classes, you may need to create a wrapper around the base class to make things work.

Basically, you need to have a full understanding of what your classes are calling, and how inheritance works.

Unfortunately, our troubles do not end there.

Super falls apart if the methods for your subclasses do not take the same arguments. I'll jump back to using constructor methods since this seems like the most likely scenario:

{% highlight python %} 
class A(object):
    def __init__(self):
        print "init A"
        super(A, self).__init__()

class B(object):
    def __init__(self, x):
        print "init B", x
        super(B, self).__init__()

class C(A):
    def __init__(self):
        print "init C"
        super(C, self).__init__()

class D(C, B):
    def __init__(self):
        print "init D"
        super(D, self).__init__()

if __name__ == '__main__':
    D()
{% endhighlight %}

    init D
    init C
    init A
    Traceback (most recent call last):
      File "test_inheritance.py", line 23, in <module>
        D()
      File "test_inheritance.py", line 20, in __init__
        super(D, self).__init__()
      File "test_inheritance.py", line 14, in __init__
        super(C, self).__init__()
      File "test_inheritance.py", line 4, in __init__
        super(A, self).__init__()
    TypeError: __init__() takes exactly 2 arguments (1 given)

To fix this situation, we need to make sure our methods always take `**kwargs` argument, and always define and call methods using keywords. That way we can pass on the keyword arguments, that are not relevant to the current instance, when we call super. Alternatively, knowing the MRO, you can also use positional arguments and pick them off in order, and use the `*args` keyword to pass on subclass arguments.

Since super seems to be quite a mess really, I would personally try to avoid it, if possible. Well, I did actually seem to run into a situation where the use of super seemed to be necessary. I have a mixin that I need to use with a few different base classes, where I do want some of the methods of the mixin to also pass on the call to the base class's method. Now that I have an idea of how this inheritance business works, I may be able to handle it, and my life can continue to be footloose and fancy-free.

Compile Time Commitment Issues
----------------------------------

You would have thought I had enough of this inheritance hellscape by now, but oh wait, there's more. I present to you dynamic inheritance for those who just can't commit to a class hierarchy at compile time.

While teasing apart the some of the backend code that I had allowed to get mixed up in my GUI code, I ran into the situation of needing dynamic multiple inheritance to fix it. "why why why, would you do that?", is probably what you are thinking. Perhaps I could have designed the code a bit better at the start to avoid this situation (ok, not perhaps... surely). But anyway, I needed to pair up mixin classes with base classes, so I decided to go this route instead of a major refactor. 

The Python builtin [type][] function allows you to do this. For example, assuming defined classes A and B, the following definitions for C are equivalent:

{% highlight python %} 
# static definition
class C(A, B):
    x = 1
    def save(self):
        print 'save stuffs'

# dynamic definition
def save(obj):
    print 'save stuffs'

C = type("C", (A, B), {'x':1, 'save': save})
{% endhighlight %}

So I can use different classes B to add to some mixin class A to dynamically. There is one more caveat that I have to work around. I also want to add the mixin class to the base class after I already have an instance of the base class B. So we need to redefine a class's subclasses after it has been instantiated. 

If I have classes A and B (which may have their own subclasses too):

{% highlight python %} 
b = B()
# we can make changes to the instance which should still be present
# after we redefine b's subclasses
b.attr = 'badger'
# keep the class name of "B", but add class A to subclasses
AB = type("B", (A,B), {})
btmemp = AB()
# merge mixin instance variables
btemp.__dict__.update(b.__dict__)
b = btemp
{% endhighlight %}

Thus, we can effectively introduce a mixin class's methods and properties to a class instance. By merging the __dict__ of the newly instantiated AB class with the existing instance b's __dict__, we get to have any variables defined in the constructor for the mixin, plus our existing state from instance b. We give preference to the existing instance b's variables, if there is a conflict.

[supersuper]: https://rhettinger.wordpress.com/2011/05/26/super-considered-super/
[harmful]: https://fuhm.net/super-harmful/
[harmful2]: http://blog.codekills.net/2014/04/02/the-sadness-of-pythons-super/
[MRO]: https://www.python.org/download/releases/2.3/mro/#id5
[MROhist]: http://python-history.blogspot.com/2010/06/method-resolution-order.html
[C3]: http://en.wikipedia.org/wiki/C3_linearization
[objectsource]: https://hg.python.org/cpython/file/2.7/Objects/typeobject.c#l2847
[type]: https://docs.python.org/2/library/functions.html#type