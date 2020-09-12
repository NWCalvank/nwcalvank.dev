---
title: Complete Guide to Transducers
date: "2020-07-01"
description: "The coolest abstraction that I'll never need to use."
---

If you’re an aspiring functional programmer looking to level-up, I think transducers are your best bet. Building my understanding of transducers led me to totally rethink my perspective on map, filter, and reduce. Though transducers are an incredibly interesting abstraction, they’re not necessarily easy to understand. But once you get it, it all clicks.

With that said, you should have a strong working knowledge of map, filter, and reduce before attempting to understand transducers. I promise this is not my attempt at gatekeeping; I just highly recommend it.

Now, if you prefer to learn through watching over reading, you can check out my video about transducers from a couple of years ago. This article goes into more intermediary steps, but the explanations are very similar.

<iframe width="670" height="377" src="https://www.youtube.com/embed/SJjOp0X_MVA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

I’ll likely re-record some of these older videos now that I have a better setup for my audio, but I think the concept is expressed reasonably well. You can get the code from that video [here](https://gist.github.com/NWCalvank/ec77b0c124f1048304cd8a08716a402f).

Final thing before I dive in, I would be remiss to not acknowledge the video that introduced me to transducers: [Inside Transducers](https://www.youtube.com/watch?v=4KqUvG8HPYo) by Rich Hickey. It’s a phenomenal video for learning how to think about transducers. If you want to see why he’s such a legend, check out this other [Transducers](https://www.youtube.com/watch?v=6mTbuzafcII) talk that he gave.

Like with many brilliant thinkers, though, it is sometimes difficult for us mere mortals to follow his explanations. My goal with this article is to break everything down as clearly-as-possible for those who, like me, would benefit from a more explicit explanation of the concept.

# The Problem to Solve

Suppose that we have an enormous data set. It’s so enormous that every iteration over the collection has a meaningful impact on our system. Our current pipeline looks like this:

```js
const tooMuchData = [1,2,3,4,5,6,7,8,9,10]

// Transformations
const add1 = x => x + 1
const double = x => x * 2

// Predicates
const isEven = x => x % 2 === 0
const isOdd = x => !isEven(x)

// Reducers
const add = (x, y) => x + y

tooMuchData.map(add1)
           .map(double)
           .filter(isOdd)
           .reduce(add)
```

We’ve decided that it’s time to optimize our code. Currently, we map over the input twice right away, so let’s compose those functions together.

```js
const tooMuchData = [1,2,3,4,5,6,7,8,9,10]

// Transformations
const add1 = x => x + 1
const double = x => x * 2
const transform = x => add1(double(x))

// Predicates
const isEven = x => x % 2 === 0
const isOdd = x => !isEven(x)

// Reducers
const add = (x, y) => x + y

tooMuchData.map(transform)
           .filter(isOdd)
           .reduce(add, 0)
```

So, we’ve managed to remove 1 intermediary array and one iteration. We reduced our complexity to 2 intermediary arrays and 3 total iterations. Unfortunately, this still isn’t good enough.

It was easy enough to compose our map functions together because map knows how to handle the transformation, regardless of how many steps there are inside the transformation function itself. It’s not so easy, however, to compose a predicate or reducer function with a transformation function.

We need some way of generalizing the map/filter/reduce methods into a single method that can handle transformation functions, predicates, and reducer functions.

We can’t use map because it doesn’t know how to use a predicate; we’d always get a boolean as the transformed value!

We can’t use filter because it discards the transformed value once it passes through the predicate; we’d always get the input value as the result.

We can’t use reduce because it doesn’t know how to do transformations or filtering. Right?

Well, we want something like this…

```js
const transformFilterReduce2 = compose(
  reduce(add), filter(isOdd), map(add1)
)
```

If we could wrap our functions in the appropriate abstraction to indicate how their return values should be used, this could allow us to compose them together. Once they’re composed together, there’s no more intermediary arrays, and there’s only one iteration through the collection.

Transducers to the rescue!

# The Essence of mapping & filtering

## Iterating with reduce

As I said at the very beginning of this article, transducers led me to rethink my understanding of map, filter, and reduce.

> What we’re attempting to extract from these abstractions is their commonality, because their commonality is what can be composed.

The key insight is that map and filter are really just a narrower, more specific implementation of reduce. With this in mind, if we could implement map and filter by way of reduce, we could find the essence of each one – meaning that we could isolate the part that’s different.

```js
const nums = [1,2,3,4,5,6,7,8,9,10]

// Transformations
const add1 = x => x + 1

// Predicates
const isEven = x => x % 2 === 0
const isOdd = x => !isEven(x)

function mapWithReduce(f, xs) {
  return xs.reduce((acc, val) => {
    return acc.concat(f(val))
  }, [])
}

mapWithReduce(add1, nums) // [2,3,4,5,6,7,8,9,10,11]

function filterWithReduce(p, xs) {
  return xs.reduce((acc, val) => {
    return p(val) ? acc.concat(val) : acc
  }, [])
}

filterWithReduce(isOdd, nums) // [1,3,5,7,9]
```

---

**Note:** Arrow functions would work just fine here, and I would personally use them instead in my own code. However, I know that some people will still struggle to read them, and since there is no relevant difference for this situation between function keyword syntax and arrow functions, I’ll use the more established option here. I don’t want anyone distracted by syntax while learning these concepts.

---

So, now we have two functions: mapWithReduce and filterWithReduce. You’ll notice that they still take the same arguments as their map and filter counterparts: an array and a function.

They then leverage reduce internally to perform the iteration.

Inside of mapWithReduce, the accumulator is built by concatenating the previous accumulator with the new transformed value. The result is that the accumulator becomes the new array, with all values transformed.

Inside of filterWithReduce, the accumulator only concatenates with values that pass the predicate check.

Looking at these implementations side-by-side, it’s clear that they have some deep similarities. Let’s make a small syntactic change to move the concat from a method call to a standard function invocation.

```js
const nums = [1,2,3,4,5,6,7,8,9,10]

const concat = (context, x) => context.concat(x)

// Transformations
const add1 = x => x + 1

// Predicates
const isEven = x => x % 2 === 0
const isOdd = x => !isEven(x)

function mapWithReduce(f, xs) {
  return xs.reduce((acc, val) => {
    // concat is the only difference
    return concat(acc, f(val))
  }, [])
}

mapWithReduce(add1, nums) // [2,3,4,5,6,7,8,9,10,11]

function filterWithReduce(p, xs) {
  return xs.reduce((acc, val) => {
    // concat is the only difference
    return p(val) ? concat(acc, val) : acc
  }, [])
}

filterWithReduce(isOdd, nums) // [1,3,5,7,9]
```

There is no logical difference between this implementation and the previous one, but this syntactic change may make the upcoming steps a bit clearer.

## Extracting the Iteration

So far, we’ve managed to re-implement map and filter via reduce, allowing reduce to handle the iteration, but we haven’t extracted the “essence” of these abstractions quite yet. Here’s what I mean…

When thinking about map, the transformation function that we give it only cares about one value at a time. It knows how to modify the value and then give it to map, which knows how to put that new value into the new copy of the collection being mapped over. It then iterates to the next value, repeating that process.

When thinking about filter, the predicate function that we give it only cares about one value at a time as well. It knows how to turn that value into a boolean, which it gives to filter, which knows whether or not to add it to the new copy of the collection being filtered. It then iterates to the next value, repeating that process.

As may or may not be horribly obvious now, if we subtract all of the similarities between map and filter, we’re left with an essence:

Putting things into a new collection vs. Conditionally putting things into a collection.

So, could we extract just that piece, removing all of the iteration logic? Yes. Yes, we could!

```js
const nums = [1,2,3,4,5,6,7,8,9,10]

const concat = (context, x) => context.concat(x)

// Transformations
const add1 = x => x + 1

// Predicates
const isEven = x => x % 2 === 0
const isOdd = x => !isEven(x)

function mapWithReduce(f) {
  return (acc, val) => {
    return concat(acc, f(val))
  };
}

nums.reduce(mapWithReduce(add1), []) // [2,3,4,5,6,7,8,9,10,11]

function filterWithReduce(p) {
  return (acc, val) => {
    return p(val) ? concat(acc, val) : acc
  }
}

nums.reduce(filterWithReduce(isOdd), []) // [1,3,5,7,9]
```

Nice!

We’ve managed to modify our functions ever so slightly to pull out the reduce function. Now, instead of returning the new copy of the array, our functions return a reducer function. This reducer function gets passed to reduce, which will gladly accept it and handle the iteration for us.

Because we call reduce on the nums array directly, we no longer need to pass it into our mapWithReduce or filterWithReduce functions. They actually don’t know anything about the collection at all… well, except for the call to concat. Perhaps that’s a hint of what else we can remove here?

## Extracting the reducer function

Notice that we’re now returning a reducer function from our mapWithReduce and filterWithReduce functions? By “reducer function,” I mean a function that takes two things and combines them in some way, where the first argument is of the same type as the return value.

These reducer functions are the type of function that can be passed to reduce as a way of reducing a collection. If this is not 100% clear, please check out the [Complete Guide to reduce](/reduce) before going much further, even if it’s just a refresher for you.

Well, the reducer function that we’re returning is actually using another reducer function internally to do the combining. Can you spot it?

That’s right, it’s our concat function, which takes two arrays and combines them into one.

So, we have a reducer function that, internally, uses another reducer function. That sounds like composition to me, and it retains the function signature. concat takes two arguments and returns one. The reducer function that mapWithReduce and filterWithReduce return also take two arguments and return one.

So long as the first argument is always a collection that can be concatenated then our concat function could be replaced by any other reducer function.

Are you ready? This is the big leap…

```js
const nums = [1,2,3,4,5,6,7,8,9,10]

const concat = (context, x) => context.concat(x)

// Transformations
const add1 = x => x + 1

// Predicates
const isEven = x => x % 2 === 0
const isOdd = x => !isEven(x)

// The essence of mapping
function mapWithReduce(f) {
  return function(rf) { // <-- this wrapper is the only real change
    return (acc, val) => {
      return rf(acc, f(val)) // <-- rf replaces 'concat'
    }
  }
}

// mapWithRf needs a reducer function
const mapWithRf = mapWithReduce(add1)
// We give it concat as a reducer function
nums.reduce(mapWithRf(concat), []) // [2,3,4,5,6,7,8,9,10]

// The essence of filtering
function filterWithReduce(p) {
  return function(rf) { // <-- this wrapper is the only real change
    return (acc, val) => {
      return p(val) ? rf(acc, val) : acc // <-- rf replaces 'concat'
    }
  }
}

const filterWithRf = filterWithReduce(isOdd)
nums.reduce(filterWithRf(concat), []) // [1,3,5,7,9]
```

Now, if you’re thinking “Holy smokes, I was following until this step. What just happened?!” please don’t panic. It’s actually fairly simple if everything has made sense up to this point.

All we’ve done is wrap our returned reducer functions (line 15 & line 29) in another function (line 14 & line 28), allowing us to accept a reducer function as an argument. This accepted reducer function replaces the hardcoded concat, which we still pass in (lines 22 & 36).

So, what does this buy us? Well, it means that mapWithReduce and filterWithReduce no longer have an opinion over how the collection is “put back together.” They will just handle transforming the value or filtering out the value, respectively. The external reduce call will handle the iteration.

It might not be clear yet, but we’ve almost solved our initial problem.

# Composing Reducer Functions

First, let’s rename our mapWithReduce and filterWithReduce functions to something more appropriate.

```js
const nums = [1,2,3,4,5,6,7,8,9,10]

const concat = (context, x) => context.concat(x)

// Transformations
const add1 = x => x + 1

// Predicates
const isEven = x => x % 2 === 0
const isOdd = x => !isEven(x)

function mapping(f) {
  // rf accepts 2 args & returns 1
  return function(rf) {
    // this function accepts 2 args & returns 1 via rf
    return (acc, val) => {
      return rf(acc, f(val))
    }
  }
}

const mapWithRf = mapping(add1)
nums.reduce(mapWithRf(concat), []) // [2,3,4,5,6,7,8,9,10]

function filtering(p) {
  // rf accepts 2 args & returns 1
  return function(rf) {
    // this function accepts 2 args & returns 1 via rf
    return (acc, val) => {
      return p(val) ? rf(acc, val) : acc
    }
  }
}

const filterWithRf = filtering(isOdd)
nums.reduce(filterWithRf(concat), []) // [1,3,5,7,9]
```

We have mapWithRf, which knows how to add 1 to a number, but it’s waiting for a reducer function – rf – to tell it how to insert that transformed value into the new collection, so we give it concat.

We do the same with filterWithRf, but what if we gave filterWithRf the reducer function that mapWithRf returns instead? Would that allow us to compose transformation and predicate functions together?

This was our original goal:

```js
const transformFilterReduce2 = compose(
  reduce(add), filter(isOdd), map(add1)
)
```

We wanted the ability to compose mapping add1 with filtering isOdd and reducing via add. Well, mapWithRf and filterWithRf can both be passed to reduce, and each is waiting for and returning a reducer function, so we should be able to compose them!

```js
const nums = [1,2,3,4,5,6,7,8,9,10]

const concat = (context, x) => context.concat(x)

// Transformations
const add1 = x => x + 1

// Predicates
const isEven = x => x % 2 === 0
const isOdd = x => !isEven(x)

// Same logic, written as an arrow function
const mapping =
    (f) => (rf) => (acc, val) => rf(acc, f(val))

const filtering =
    (p) => (rf) => (acc, val) => p(val) ? rf(acc, val) : acc

// Helpers for composition
const apply = (x, f) => f(x)
const compose = (...funcs) => x => funcs.reduceRight(apply, x)

// Same *WithRf functions as before
const mapWithRf = mapping(add1)
const filterWithRf = filtering(isOdd)

const transformFilter = compose(filterWithRf, mapWithRf)
nums.reduce(
  transformFilter(concat), // <-- concat is an rf...
  [], // concat returns an array -- this is the init value for an array
) // [ 2, 4, 6, 8, 10 ] UH OH!!
```

Oh no! Why did we get even numbers? We asked for the odd ones, and compose works from right-to-left, so the filtering should have occurred second, right? Well, yes. But also no.

---

**Warning:** The following few sentences are a tangent that could be skipped completely.

Due to the fact that we are partially-applying functions that return yet another function (instead of a value) during the composition (line 27), the order of execution is seemingly “reversed.”

This is because a typical composition would involve wrapping a function that’s expecting a value around a function that returns a value of that type, but here we’re wrapping a function that’s expecting a function around another function that returns a function. This means that the outer function actually invokes the inner function during its execution.

You can walk through the partial application steps if you wish, but it’s really not necessary for understanding transducers.

---

So, all that is to say that we should simply remember to reverse the order of our composition when composing these functions.

```js
const nums = [1,2,3,4,5,6,7,8,9,10]

const concat = (context, x) => context.concat(x)

// Transformations
const add1 = x => x + 1

// Predicates
const isEven = x => x % 2 === 0
const isOdd = x => !isEven(x)

// Same logic, written as an arrow function
const mapping =
    (f) => (rf) => (acc, val) => rf(acc, f(val))

const filtering =
    (p) => (rf) => (acc, val) => p(val) ? rf(acc, val) : acc

const apply = (x, f) => f(x)
const compose = (...funcs) => x => funcs.reduceRight(apply, x)

const mapWithRf = mapping(add1)
const filterWithRf = filtering(isOdd)

const transformFilter = compose(mapWithRf, filterWithRf)
nums.reduce(transformFilter(concat), []) // [ 3, 5, 7, 9, 11 ] Much better!
```

We’ve almost achieved our original goal. We just need to include the add step!

```js
const nums = [1,2,3,4,5,6,7,8,9,10]

const concat = (context, x) => context.concat(x)

// Transformations
const add1 = x => x + 1

// Predicates
const isEven = x => x % 2 === 0
const isOdd = x => !isEven(x)

// Reducers
const add = (x, y) => x + y

// Same logic, written as an arrow function
const mapping =
    (f) => (rf) => (acc, val) => rf(acc, f(val))

const filtering =
    (p) => (rf) => (acc, val) => p(val) ? rf(acc, val) : acc

const apply = (x, f) => f(x)
const compose = (...funcs) => x => funcs.reduceRight(apply, x)

const mapWithRf = mapping(add1)
const filterWithRf = filtering(isOdd)

const transformFilter = compose(mapWithRf, filterWithRf)
nums.reduce(
  transformFilter(add),
  0, // add returns a number -- this is the init value for a number
) // 35 (added 1 to nums, filtered out the even, summed the remaining)
```

Boom!

Just like that, we’re performing 1 iteration with no intermediary arrays.

The initial value (0) is passed into mapping as the acc, with 1 as the val. The 1 is incremented and passed as the val to filtering, which decides not to combine it with 0 because it’s now even. Instead, filtering returns the current accumulated value. This means that reduce receives 0 as the accumulated value for the next iteration.

The 0 is then passed to mapping again as the acc, but with 2 as the val because 2 is the next element in the nums array. The 2 is incremented and passed as the val to filtering, which also receives 0 as the initial value. Since 2 is now 3 and 3 passes isOdd, 3 is combined with 0 via add. This makes 3 the new accumulated value for the next iteration.

If you’re comfortable with reduce, you’ll be able to picture how the rest of this process unfolds (pun intended).

For real, though, how cool is that?

# Transducers

You’ve now worked with transducers! We just didn’t call it that. If we wrap up our call site from above into a little transduce helper, things start to feel a little better.

```js
const transduce = (xf, rf, init, xs) =>
  // call reduce on the data structure
  // pass the rf to the composed transformation
  // pass in the initial value
  xs.reduce(xf(rf), init)

transduce(transformFilter, add, 0, nums) // 35
```

I’ve chosen not to copy/paste all of the code for transformFilter into the above block to avoid distraction. The transduce function is all that’s new here.

The transduce function takes 4 arguments: a transducer, a reducer function, an initial value, and the collection.

That’s right, the first value is a transducer. Our transformFilter function is a transducer.

> A transducer is a function that accepts a reducer function and returns a reducer function, allowing them to be composed together. A composition of two transducers produces another transducer.

In other words, mapWithRf and filterWithRf are transducers. The resulting composition of these transducers, which we called transformFilter, is also a transducer. If you don’t believe me, try replacing transformFilter with one of the other two functions and see if things still work.

So, we can transform, filter, and sum an array, but what if we just wanted to transform and filter it? Could we use a transducer to do that?

```js
const xform = compose(
  // reminder: these are transducers
  // composition of transducers returns a new transducer
  mapping(add1),
  filtering(isOdd),
  mapping(double),
  mapping(add1),
)

transduce(xform, concat, [], nums) // [ 7, 11, 15, 19, 23 ]
```

**Note:** The idiomatic name for the first argument passed to a transducer seems to be xform, so that’s the name that I’ve opted for here.

So yes, we can use a transducer for mapping and filtering because these functions are both implemented with reduce, and concat is a reducer function that knows how to add things to an array.

In this example, the first element (1) is filtered out since it is not odd once it is incremented. Because filtering chooses to exclude this value, it never calls the next reducer function (the result of mapping(double)), so that iteration terminates as the current accumulator is returned to reduce and is used for the next iteration.

The second element becomes 3, which passes the predicate, is doubled to become 6, and then incremented to become 7 as the first element of the new array. This pattern holds for the rest of nums.

# Agnostic to Data Structure

A striking benefit of transducers that I haven’t even touched on yet is that they are easily reused across data structures, provided that the data type implements reduce, a “join” function/method, and a way of producing an empty/initial value.

As we can see from the transduce call site, we provide the reducer function (the “join” or “combine” logic) for the transduction as well as the initial value for the entire operation. This means that the transducer is fully decoupled from the input/output collection types.

With that in mind, we can create a new data structure to pass through our transducer(s). All we have to do is implement reduce, which I’ll do by cheekily wrapping an array and leveraging Array.prototype.reduce to save on complexity.

```js
// super lame example of implementing reduce on another data structure
const dataStructure = {}
// Allows us to map/filter/reduce
dataStructure.reduce = function(rf, init) {
  return this.value.reduce(rf, init)
}
// Allows us to add new elements into our collection
dataStructure.concat = function(x) {
  return Object.assign(this, { value: this.value.concat(x) });
}
// Allows us to get an initial value
dataStructure.of = function(...xs) {
  const value = xs === undefined ? [] : xs
  return { ...dataStructure, value: value }
}

const newNums = dataStructure.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)

newNums.reduce(add, 0) // 55
dataStructure.of().reduce(add, 0) // 0
```

Because we have implemented reduce on this data structure, we can now apply our existing transducer(s) to it, as though it were the same as an array.

```js
const nums = [1,2,3,4,5,6,7,8,9,10]
const newNums = dataStructure.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)

transduce(
  xform, //   <-- same xform used on array of numbers
  add, //     <-- newNums contains numbers
  0, //       <-- init value for addition
  newNums, // <-- dataStructure of range 1..10
) // 75

transduce(
  xform,
  add,
  0,
  nums, // <-- the only difference
) // 75
```

Since we have implemented concat (which is likely called conj if you look at Clojure examples), we can also replace add to stick with just the mapping and filtering steps, creating a new instance of dataStructure.

```js
transduce(
  xform, //              <-- same xform used on array of numbers
  concat, //             <-- dataStructure implements concat method, which concat function uses
  dataStructure.of(), // <-- return init value
  newNums, //            <-- dataStructure of range 1..10
)

transduce(
  xform, // <-- reused every single time, regardless of data structure or rf
  concat,
  [],
  nums,
)
```

Just like that, our new data type has been transformed, filtered, and reduced by our existing transducer (xform). Personally, I find that really cool.

If you’d like to learn more about writing against an interface from a functional programming perspective, check out this little video that I made about the topic.

<iframe width="670" height="377" src="https://www.youtube.com/embed/-kuMXd_coW0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

# That’s it

Well, that’s all I have for you on this one.

Here’s an executive summary of the code we wrote, excluding intermediary steps. This is a good snippet to copy/paste if you’d like to play with these functions on your own.

```js
const nums = [1,2,3,4,5,6,7,8,9,10]

// Helpers
const concat = (context, x) => context.concat(x)
const apply = (x, f) => f(x)
const compose = (...funcs) => x => funcs.reduceRight(apply, x)
const transduce = (xf, rf, init, xs) => xs.reduce(xf(rf), init)

// Transformations
const add1 = x => x + 1
const double = x => x * 2

// Predicates
const isEven = x => x % 2 === 0
const isOdd = x => !isEven(x)

// Reducers
const add = (x, y) => x + y

const mapping =
    (f) => (rf) => (acc, val) => rf(acc, f(val))

const filtering =
    (p) => (rf) => (acc, val) => p(val) ? rf(acc, val) : acc

const xform = compose(
  mapping(add1),
  filtering(isOdd),
  mapping(double),
  mapping(add1),
)

// Custom data structure
const dataStructure = {}
dataStructure.reduce = function(rf, init) {
  return this.value.reduce(rf, init)
}
dataStructure.concat = function(x) {
  return Object.assign(this, { value: this.value.concat(x) });
}
dataStructure.of = function(...xs) {
  const value = xs === undefined ? [] : xs
  return { ...dataStructure, value: value }
}

const newNums = dataStructure.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)

// Final Examples
transduce(xform, add, 0, newNums)
transduce(xform, add, 0, nums)
transduce(xform, concat, dataStructure.of(), newNums)
transduce(xform, concat, [], nums)
```

Transducers are really neat, and I love the way that they encourage me to think about data manipulation. Despite the fact that I may never have a proper use case for them in my work, I think I’m better off for having taken the time to understand them.

I’ll leave you with some resources that might be helpful for further learning, even if I’ve referenced them already.

[Transducers](https://www.youtube.com/watch?v=6mTbuzafcII&t=178s) by Rich Hickey  
[Inside Transducers](https://www.youtube.com/watch?v=4KqUvG8HPYo&t=1952s) by Rich Hickey  
[Clojure Transducer Docs](https://clojure.org/reference/transducers)  
[Transducers Explained](https://www.youtube.com/watch?v=SJjOp0X_MVA) by Me 🙂
