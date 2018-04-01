---
layout: default
short: Multiple Inheritance in Python
comments: True
---

Multiple Inheritance Minefield
===============================

So I thought I knew how to use inheritance in Python properly. However, when I had a need to use multiple inheritance, I found I did not, in fact, know what was happening. Nothing here is new, it is all in the python docs, and if you are looking for a good explanation of multi class inheritance in Python I found [this account][supersuper] well-written and useful. ...But then I also found [a detractor][harmful], or [two][harmful2]. I thought I'd write my own post to digest all the concepts myself.

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
        super().__init__()
{% endhighlight %}

Alternatively, the constructor of the base class can be called directly:

{% highlight python %}
class MyClass(BaseClass):
    def __init__(self):
        BaseClass.__init__(self)
{% endhighlight %}

While looking up code on the internet, I have seen plenty examples of both.

I had assumed the above statements were equivalent, since, of course, the super class of `MyClass` is `BaseClass` anyways. For most of my experience, they were. This is because like any good Pythonista, I had avoided multiple inheritance, treating it as a tool only to be used when there are no other reasonable solutions.

First, let's look at a simple single inheritance set of classes:

{% highlight python %}
class Animal(object):
    def __init__(self):
        print("init Animal")

class Dog(Animal):
    def __init__(self):
        print("init Dog")
        super(Dog, self).__init__()

class GermanShepard(Dog):
    def __init__(self):
        print("init GermanShepard")
        super(GermanShepard, self).__init__()

if __name__ == '__main__':
    gsd = GermanShepard()
{% endhighlight %}

which prints:

    init GermanShepard
    init Dog
    init Animal

I would have thought calling super in `Animal` superfluous. Since we are inheriting from `object`, which is the root class of all objects in python, it will effectively do nothing. After all, [object.__init__()][objectsource] doesn't do anything anyways. I omitted it in the above example, and it executes fine. However, as I show in the next section there is a reason to call super in classes which inherit from `object`.

Note, this post is assuming new style classes, which came in under Python 2.2. Although the use of new-style classes is now considered standard, old-style is still default in all Python 2 versions for backwards-compatibility reasons. Attempting to use super with old-style classes will meet you with an error. I ran into this while trying to subclass some third-party code.

{% highlight shell %}
Traceback (most recent call last):
  File "example.py", line 29, in <module>
    OldClass()
  File "example.py", line 24, in __init__
    super(OldClass, self).__init__()
TypeError: must be type, not classobj
{% endhighlight %}

Next method invocation, not super class
----------------------------------------

Now let's look at a slightly more complicated example that uses multiple inheritance. A use-case for multiple inheritance is a pattern called [mix-ins][mix_in]. This is when you have a class whose methods and attributes you'd like to _blend in_ to an existing class. Let's add a `GoodBoy` mixin to the previous example:

{% highlight python %}
class Animal(object):
    def __init__(self):
        print("init Animal")

class GoodBoy(object):
    def __init__(self):
        print("They're all good dogs")

class Dog(Animal):
    def __init__(self):
        print("init Dog")
        super(Dog, self).__init__()

class GermanShepard(Dog,GoodBoy):
    def __init__(self):
        print("init GermanShepard")
        super().__init__()

if __name__ == '__main__':
    gsd = GermanShepard()
{% endhighlight %}

which prints:

    init GermanShepard
    init Dog
    init Animal

Why didn't our `GoodBoy` class's `__init__` method get called?

In truth, super is not calling the current class's super class(es), it is calling the next class in the Method Resolution Order (MRO). When you have single inheritance, this is simply the chain of inheritance from the final subclass you have created all the way up to `object`. It is represented as a tuple of classes. To see the MRO for a given class you can look at the `__mro__` attribute or the `mro()` method on a class.

Let's look at the MRO of `GermanShepard` from the above example:

    >>> GermanShepard.__mro__
    (<class '__main__.GermanShepard'>, <class '__main__.Dog'>, <class '__main__.Animal'>, <class '__main__.GoodBoy'>, <class 'object'>)

Python assembles the MRO upon declaration of a new class. It will iterate through this list each time `super` is called. So, if a class is used as a super class in a multiple inheritance situation, it is possible that there are other classes after it in the MRO, even if it inherits from `object`. Whether or not an overridden method gets executed depends on whether `super` was called from the class preceding it in the MRO.

Now let's add `super` calls to all our classes, and try again.

{% highlight python %}
class Animal(object):
    def __init__(self):
        print("init Animal")
        super().__init__()

class GoodBoy(object):
    def __init__(self):
        print("They're all good dogs")
        super().__init__()

class Dog(Animal):
    def __init__(self):
        print("init Dog")
        super().__init__()

class GermanShepard(Dog,GoodBoy):
    def __init__(self):
        print("init GermanShepard")
        super().__init__()

if __name__ == '__main__':
    gsd = GermanShepard()
{% endhighlight %}

The output is as expected:

    init GermanShepard
    init Dog
    init Animal
    They're all good dogs

When the constructor for `GermanShepard` gets called it uses the MRO to find which `__init__()` method it should call, which in this case is `GermanShepard` itself. After that, to get the other __init__ methods to execute, super needs to be called in each successive __init__ method. Each call to super executes the next __init__ method until either the MRO runs out, or an __init__ method returns without calling super.

Alternatively, the MRO can be subverted by calling a certain __init__ explicitly, as mentioned at the beginning of this post.

However, perhaps you didn't think that class you wrote would be used in a multiple inheritance situation ...but later that changed. Even more critically, if you are writing a library that other people will use, it could result in unexpected behavior. For example, if someone wrote some library code without the use of super:

{% highlight python %}
class A(object):
    def __init__(self):
        pass

class C(A):
    def __init__(self):
        A.__init__(self)
{% endhighlight %}

And you have your own class B that you want to mixin, for which you have diligently used super to connect your class hierarchy:

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


Mo classes, mo problems
------------------------

The inverse of the above situation is also true. Say you are using a base class that does call super in the constructor:

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

So let's just all be super
---------------------------

Really, you need to consistently use super, or use it not at all. Except, this is not the end of the story, because if you use it *too* consistently you can still run into problems. The above examples all used the init method because all objects have an `__init__` method that should be called on object initiation, so it is a common place where things go wrong. There is nothing special about the `__init__` method with respect to inheritance and the MRO. The MRO is applied to all methods in a class, any time you use `super`. For example:


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

Here are some guidelines, or things to keep in mind about building a class hierarchy:

* When inheriting from multiple classes and you care about order of base class method calls, keep the classes you want called earlier on the left in the class declaration.
* Know what the last class in the MRO to define a certain method is. Do not call super in this method.
* If you are not the author of either the inherited classes, you may need to create a wrapper around the base class to make things work.

Basically, you need to have a full understanding of what your classes are calling, and how inheritance works.

Unfortunately, our troubles do not end there.

Super falls apart if the methods for your subclasses do not take the same arguments. I'll jump back to using constructor methods since this seems like the most likely scenario:

{% highlight python %}
class A(object):
    def __init__(self):
        print("init A")
        super(A, self).__init__()

class B(object):
    def __init__(self, x):
        print("init B", x)
        super(B, self).__init__()

class C(A):
    def __init__(self):
        print("init C")
        super(C, self).__init__()

class D(C, B):
    def __init__(self):
        print("init D")
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

Or, if we try to pass x in from `D`:

{% highlight python %}
class A(object):
    def __init__(self):
        print("init A")
        super(A, self).__init__()

class B(object):
    def __init__(self, x):
        print("init B", x)
        super(B, self).__init__()

class C(A):
    def __init__(self):
        print("init C")
        super(C, self).__init__()

class D(C, B):
    def __init__(self):
        print("init D")
        super(D, self).__init__(x=42)

if __name__ == '__main__':
    D()
{% endhighlight %}

    init D
    Traceback (most recent call last):
      File "example.py", line 71, in <module>
        D()
      File "example.py", line 41, in __init__
        super(D, self).__init__(x=42)
    TypeError: __init__() got an unexpected keyword argument 'x'

To fix this situation, we need to make sure our methods always take `**kwargs` argument, and always define and call methods using keywords. That way we can pass on the keyword arguments, that are not relevant to the current instance, when we call super. Alternatively, knowing the MRO, you can also use positional arguments, pick them off in order, and use the `*args` keyword to pass on subclass arguments.

{% highlight python %}
class A(object):
    def __init__(self,**kwargs):
        print("init A")
        super(A, self).__init__(**kwargs)

class B(object):
    def __init__(self, x, **kwargs):
        print("init B", x)
        super(B, self).__init__(**kwargs)

class C(A):
    def __init__(self, **kwargs):
        print("init C")
        super(C, self).__init__(**kwargs)

class D(C, B):
    def __init__(self):
        print("init D")
        super(D, self).__init__(x=42)
{% endhighlight %}


Compile Time Commitment Issues
----------------------------------

You would have thought I had enough of inheritance by now, but there is more fun to be had. I present to you dynamic inheritance for those who just can't commit to a class hierarchy at compile time. Disclaimer: don't actually do this, it's terrible.

While teasing apart the some of the backend code that I had allowed to get mixed up in my GUI code 😬, I ran into the situation of needing dynamic multiple inheritance to fix it. Perhaps I could have designed the code a bit better at the start to avoid this situation (ok, not perhaps... surely). But anyway, I needed to pair up mixin classes with base classes, so I decided to go this route instead of a major refactor.

The Python builtin [type][] function allows you to do this. For example, assuming defined classes A and B, the following definitions for C are equivalent:

{% highlight python %}
# static definition
class C(A, B):
    x = 1
    def save(self):
        print('save stuffs', self)

c1 = C()
print(c1.x)
c1.save()

# dynamic definition
def save(obj):
    print('save stuffs', obj)

C = type("C", (A, B), {'x':1, 'save': save})

c2 = C()
print(c2.x)
c2.save()
{% endhighlight %}

    1
    save stuffs <__main__.C object at 0x1037159e8>
    1
    save stuffs <__main__.C object at 0x103715b00>

Using the second method, I can use variable classes to the `type` method to dynamically construct a new class, without hard-coding the base classes ahead of time.

There is one more caveat that I have to work around. I want to add the mixin class to the base class *after* I already have an instance of the base class B. So we need to redefine a class's base classes after it has been instantiated. (This doesn't make sense?)

If I have classes A and B (which may have their own subclasses too):

{% highlight python %}
class C(A):
    def __init__(self):
        super(C, self).__init__()

c = C()
print(type(c).__mro__)

# we can make changes to the instance which should still be present
# after we redefine b's base classes
c.attr = 'puppies'
# keep the class name of "B", but add class A to subclasses
CAB = type("C", (A,B), {})
ctemp = CAB()
# merge mixin instance variables
ctemp.__dict__.update(c.__dict__)
c = ctemp

print("After splicing in another base class:")
print(c.attr)
print(type(c).__mro__)
{% endhighlight %}

    (<class '__main__.C'>, <class '__main__.A'>, <class 'object'>)
    After splicing in another base class:
    puppies
    (<class '__main__.C'>, <class '__main__.A'>, <class '__main__.B'>, <class 'object'>)

Thus, we can effectively introduce a mixin class's methods and properties to a class instance. By merging the `__dict__` of the newly instantiated CAB class with the existing instance c's `__dict__`, we get to have any variables defined in the constructor for the mixin, plus our existing state from instance `c`. We give preference to the existing instance c's variables, if there is a conflict.


[supersuper]: https://rhettinger.wordpress.com/2011/05/26/super-considered-super/
[harmful]: https://fuhm.net/super-harmful/
[harmful2]: http://blog.codekills.net/2014/04/02/the-sadness-of-pythons-super/
[mix_in]: https://en.wikipedia.org/wiki/Mixin
[MRO]: https://www.python.org/download/releases/2.3/mro/#id5
[MROhist]: http://python-history.blogspot.com/2010/06/method-resolution-order.html
[C3]: http://en.wikipedia.org/wiki/C3_linearization
[objectsource]: https://hg.python.org/cpython/file/2.7/Objects/typeobject.c#l2847
[type]: https://docs.python.org/2/library/functions.html#type