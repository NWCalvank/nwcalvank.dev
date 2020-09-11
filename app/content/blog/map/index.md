---
title: Complete Guide to map
date: "2020-06-10T22:12:03.284Z"
description: "The Functional Programming gateway drug."
---

Iteration through a collection is one of the most common elements of a typical piece of software.

A for loop addresses this problem effectively and prolifically, across many languages today. It is flexible, yet powerful – a seemingly perfect combination for broad application. However, this flexibility comes with a drawback: a for loop has no opinion on how the collection being iterated over is treated.

It doesn’t care whether the collection is updated in-place or if a new collection is returned. It also doesn’t care if every element in the collection is visited; maybe the loop will step by 2, for example. To really drive this point home, it also doesn’t prescribe a return type, should one be created.

None of these are criticism of a for loop. They are wonderful largely because of this flexibility. With that said, there are a few very common patterns that for loops are often used to implement. These patterns have been recognized as being so common that they are core library abstractions in many, if not all, of the popular high-level languages used today.

These patterns have been abstracted into:

- map
- filter
- reduce / fold

In this post, we’ll be discussing `map`.

## Why map?

Suppose that you have a simple function for incrementing numbers.

```js
const inc = x => x + 1
```

It has been doing great work for you in your application. Anytime that you give it a number, it gives you back an incremented number. Glorious!

But, one day, some new requirements slide across your desk: there’s a list of three numbers that each need to be incremented.

You start by doing something like this:

```js
const nums = [1,2,3]
const inc = x => x + 1

const newNums = []
newNums[0] = inc(nums[0])
newNums[1] = inc(nums[1])
newNums[2] = inc(nums[2])
```

You push this code up for review, and you team tells you to DRY it up. So, you swap it out for a for loop.

```js
const nums = [1,2,3]
const inc = x => x + 1

const newNums = nums
for (i in newNums) {
  newNums[i] = inc(nums[i])
}
```

This gets merged in and deployed. You’re quite pleased with yourself until you hear about a new bug report. Your code has introduced a regression.

While you thought that you were making a copy of the nums array, you had accidentally passed it by reference into newNums. As a result, nums has also had all of its values incremented. Whoops!

Now, this is clearly a hyperbolic and contrived situation, but it does illustrate a problem that can arise with more complex systems (more complex than incrementing a list of numbers, for example). While refactoring your code into a for loop, you’ve inadvertently asked the program to do the wrong thing by misconfiguring the variable initialization.

Just as Object Oriented Programming comes with its fair share of design patterns, best practices, and anti-patterns, Functional Programming has its own set of principles to help us avoid making mistakes like the one outlined above.

For example, the map function would be a perfect substitute for the for loop above. It would help to avoid accidental mutation of the nums array and would clearly communicate your intentions to the future readers of your code.

So, let’s learn about `map`.

## What is map?

`map` is a higher-order function, which means that it accepts another function as one or more of its arguments. This allows map to provide a general pattern, without being implementation-specific.

Here is how we could use `map` to replace the for loop in the opening example:

```js
const inc = x => x + 1

const nums = [1,2,3]
const newNums = nums.map(inc)

console.log(nums) // [1,2,3]
console.log(newNums) // [2,3,4]
```

I will sprinkle in some Python examples for those who are less familiar with or averse to JavaScript. I expect that you’ll be comfortable with at least one of these two languages.

```python
list(map(lambda x: x + 1, [1,2,3])) # [2,3,4]
```

As you can see, the first argument provided to `map` is a function. In Python, the second argument is the collection on which to operate. In JavaScript, which implements `map` as a method on Array.prototype, passes in the collection on the left of the period as the execution context.

The **first argument**, which we’ll call the “transformation function,” knows **how to operate on each value** inside of the collection, but it doesn’t know anything about the collection itself.

The `map` function doesn’t know anything about the transformation function or the values in the collection, but it **does know how to access the values from outside of the collection.**

> In other words, `map` allows a function that operates on values to operate on a collection of those values.

The job of `map`, then, is to handle the iteration over the collection and the creation of a new collection. It does not, however, have any opinion on the transformation that occurs on each value.

We could imagine an implementation of `map` for arrays as follows:

```js
// This is for educational purposes only and may help someone who is familiar with for loops
const map = (transformationFunction, array) => {
  const newArray = [];

  for (i in array) {
    const newValue = transformationFunction(array[i], i, array)
    newArray.push(newValue);
  }

  return newArray;
};
```

Or the same concept in Python:

```python
def map(tf, col):
  new_list = []

  for val in col:
    new_list.append(tf(val))

  # Technically, Python 3 returns a map object, not a list
  # But conceptually, this is a reasonable mental model
  return new_list
```

## The Rules of map

Other than the shortened syntax, it might not be immediately clear why `map` is so useful when compared to a `for` loop. This is where the `map` rules come in:

- There must always be a return value
- The return value collection type must always be the same as the input collection type
- Every value in the collection will be visited once
- The transformation function will be given one value at a time as its input
- All transformed values will be added to the returned collection

Put much more succinctly (from Haskell’s `fmap`):

```haskell
map :: (a -> b) -> f a -> f b
```

In human-speak, this means that map takes, as it’s first argument, a function that accepts values of type a and returns values of type b. It then accepts a collection (called a Functor – f) of types a (ex. an Array of numbers) and returns a collection (f) of types b (ex. an Array of booleans).

The key here is that the type f has not changed, meaning that giving map an Array will result in map returning an Array. However, the types of the values in that Array may or may not be the same when comparing the input to the output.

For example, we could modify our examples above to return a list of booleans, indicating whether or not a number in the original list was even:

```js
[1,2,3].map(x => x % 2 === 0) // [false, true, false]
```

```python
list(map(lambda x: x % 2 == 0, [1,2,3])) # [False, True, False]
```

## Why this Matters

The benefit of map following a strict set of rules is that it clearly communicates the intention of this piece of code to the person who is reading it. Remember, we write code for humans to read!

With readability in mind, map becomes very expressive when compared to a for loop because we know that map is being used to create a new collection of the same type by transforming the values inside of that collection. Notably: this is done without modifying the input collection.

Take the follow code as an example:

```js
const add1 = x => x + 1
const nums = [1,2,3,4,5]

nums.map(add1) // returns [2,3,4,5,6]

console.log(nums) // [1,2,3,4,5]
```

```python
def add1(x):
    return x + 1

nums = [1,2,3,4,5]

list(map(add1, nums)) # returns [2,3,4,5,6]

print(nums) # [1,2,3,4,5]
```

As we can see, map has not modified nums. We have provided map with the function add1, which is a pure function. In a language like JavaScript, you can pass impure functions to map without the language punishing you, but your colleagues likely will, as this is confusing.

Coming from a Functional Programming paradigm, map is intended to indicate a pure operation. For impure operations, it’s best to use some variation of a for loop.

Here is an example of a comparable impure operation:

```js
const nums = [1,2,3,4,5]

nums.forEach((x, i, _nums) => _nums[i] = x + 1)

console.log(nums) // [2,3,4,5,6]
```

```python
nums = [1,2,3,4,5]

for i, x in enumerate(nums):
    nums[i] = x + 1

print(nums) # [2,3,4,5,6]
```

When used consistently across a codebase, map can quickly signal to future readers that the code here is pure, allowing a for loop to signal that the operation is likely impure.

## Chaining / Composition

I would be remiss to not mention chaining or composition in an article about map. Chaining is a syntactic alteration of typical, Lisp-like composition, but they do the same thing in practice.

Composition allows you to easily pass the output of one function into another function. This, effectively, creates one larger function. map makes this pattern feel very natural and intuitive because we can count on it to be pure and to always provide us with a return value. As a result, the function receiving the output from the map has all of the information it could need to do its work.

Let’s start with an example of dot chaining syntax:

```js
const add1 = x => x + 1
const nums = [1,2,3]

const newNums = nums
                  .map(add1) // [2,3,4]
                  .map(add1) // [3,4,5]

console.log(newNums) // [3,4,5]

```

And Lisp-like composition syntax:

```python
def add1(x):
    return x + 1

nums = [1,2,3]

new_nums = list(                     # [3,4,5]
               map(add1,             # [3,4,5] - a map object
                   map(add1, nums))) # [2,3,4] - a map object

print(new_nums) # [3,4,5]
```

Both of these examples are quite goofy, as you wouldn’t chain or compose the exact same function in two separate map calls, but it hopefully illustrates the point. The map rules make composition a natural consequence of collection transformation.

## A Note on Performance

It is important to note that a new collection is typically created in-memory between each map invocation, whether using chaining or Lisp-like syntax. I stay “typically” because compilers can sometimes recognize these common patterns and optimize for them, particularly if the types are easily inferred or explicitly provided.

If performance becomes an issue, the easiest solution is likely to compose your transformation functions together prior to passing them into map. This allows each value to be fully-transformed before the next value is addressed. The result is that O(n) extra space is used because the intermediary collections are not created, and the transformation runs in O(n) time.

To illustrate this point:

```js
const add1 = x => x + 1
const isEven = x => x % 2 === 0

// Add 1 and then check if the result is even
const add1IsEven = x => isEven(add1(x))

const bools = [1,2,3].map(add1IsEven)

console.log(bools) // [true, false, true]
```

```python
def add1(x):
    return x + 1

def is_even(x):
    return x % 2 == 0

add1_is_even = lambda x: is_even(add1(x))

bools = list(map(add1_is_even, [1,2,3]))

print(bools) # [True, False, True]
```

## Functors

So far, we’ve been discussing map in terms of Arrays or Lists. This is because they are a common data type that falls into a larger category called “Functors.” Functors were briefly mentioned earlier in the Haskell type definition for fmap, but now it is time to discuss them more thoroughly.

Functors are, in a practical sense, defined by their implementation of map. Because Arrays and Lists implement map, they are each a type of Functor. The nice thing about a Functor is that it establishes a standard interface that new data types can be built to implement. This allows us to create, should we choose to, custom data types that pass through existing code that was originally built for Arrays or Lists.

Let’s start by defining our own Functor, which may illustrate what I’m saying more clearly.

```js
const myFunctor = {
  value: 1,
  map: function (f) {
    const newFunctor = Object.assign({ }, myFunctor)
    newFunctor.value = f(this.value)
    return newFunctor
  }
}
```

This data type ships with an implementation of map, which accepts a transformation function that will be applied to the value property before returning a new instance of the Functor with the updated value.

Check out my video on this topic for an in-depth explanation and walk-through of creating Functors.

[![Monad Mini-Series: Functors](https://img.youtube.com/vi/pgq-Pfg6ul4/0.jpg)](https://www.youtube.com/watch?v=pgq-Pfg6ul4)

To easily share code across multiple Functors in JavaScript, it helps to define a `map` function that circumvents the dot syntax.

```js
const map = (f, context) => context.map(f);

map(x => x + 1, [1,2,3]) // [2,3,4]

map(x => x + 1, myFunctor) // { value: 2, map: ... }
```

As you can see, we now pass in a transformation function and a Functor, an Array in the first case and myFunctor in the second, as arguments to map, which defers to the Functor’s implementation of .map(). While the Functor interface is extremely minimal, having this standard interface to develop against allows us to now pass our custom Functor into our map function.

We can use this concept to create shared code, as illustrated with this simple example.

```js
const add1 = x => x + 1

const add1ToAll = functor => functor.map(add1)

const newArray = add1ToAll([1,2,3])
console.log(newArray) // [2,3,4]
add1ToAll(newArray)   // [3,4,5]

const newMyFunctor = add1ToAll(myFunctor)
console.log(myFunctor)    // { value: 1, map: ... }
console.log(newMyFunctor) // { value: 2, map: ... }
add1ToAll(newMyFunctor)   // { value: 3, map: ... }
```

As you can see, we created a shared function called add1ToAll which will accept any Functor – not just Arrays or Lists. We passed in our custom data type and got back a new instance of that data type with the updated value. Our original myFunctor instance hasn’t been modified, and we didn’t need to create any custom code for it at the call site.

Our custom data type has safely and successfully passed through a function that appears to have been written for JavaScript Arrays. The add1ToAll function knows nothing about myFunctor‘s implementation of map, nor does add1. We have managed to ship a new data type without modifying any existing code. This is neat stuff!

## That's the Basics

Thanks for reading! In this article, we covered map, which is one of the most fundamental concepts in Functional Programming. If this is your first exposure to Functional Programming, you may be surprised to hear that there’s more to the concept of mapping than I’ve outlined here.

For example, there are powerful optimization patterns called transducers, which I will outline in a future article. map is an excellent first step into these patterns, so if you’re just getting started, you’ve chosen a good place to begin. Next, I’d encourage you to learn about filter and reduce to see how those can be used alongside map to create powerful compositions from simple pieces.
