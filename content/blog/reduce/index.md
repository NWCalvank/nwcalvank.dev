<style>
  .markdown-body h1 {
    border-bottom: none;
  }

  .markdown-body #nwcalvankdev a:hover  {
    text-decoration: none;
  }

  @media (prefers-color-scheme: dark) {
    h1, h2, p, li, #nwcalvankdev a {
      color: #fff;
    }

    .markdown-body {
      color-scheme: dark;
    }
</style>

# [NWCalvank.dev](/)

# Complete Guide to reduce

**June 26th, 2020**

---

I’ll try to avoid getting too excited here, but the concept of “reducing” or “folding” over a collection is one of my favourites in all of programming. The wild versatility of this abstraction is honestly difficult to overstate.

I expect that this will be a long article, so get comfortable, maybe grab a snack, and let’s get down to brass tacks.

# Prerequisites

I know. This isn’t school, and I won’t stop you from reading ahead if you’re not familiar with these topics already, but I would recommend that you make yourself comfortable with map and/or filter before diving into reduce.

I’ve prepared these guides with a preferred but not-essential reading order of:

1. [Complete Guide to map](/map)
2. [Complete Guide to filter](/filter)
3. [Complete guide to reduce](/reduce)

With that said, if you already have a strong grasp of list iteration and higher-order functions then you’ll be fine here.

If you’re comfortable with recursion, you’ll be even better prepared.

# The Concept of “Reducing”

We’ll be building up reduce from a number of small, fairly simple concepts. The first is extraordinarily straightforward, though you have to wrap your mind around it in a broader sense than you may have up to this point.

Let’s see what it looks like to “reduce” two numbers.

```js
const reduced = 3 + 4

console.log(reduced) // 7
```

Now, that’s one way to reduce two numbers together. How else could we do it? Well, we could multiply them instead of adding them together.

```python
reduced = 3 * 4

print(reduced) # 12
```

Obviously, if addition and string concatenation were the peak implementation of “reducing” then I wouldn’t be so excited about it. So, what’s the purpose of these examples?

Well, they illustrate the basic concept. We’re taking two things and combining them into one new thing. Let’s break this concept out into a function.

```js
const reducerFunction = (str1, str2) => str1 + str2

const reduced = reducerFunction("Hello ", "World")

console.log(reduced) // "Hello World"
```

Great. So, we now have a function that takes two things (strings) and returns a new thing (the concatenated strings). We’ll refer to this as our “reducer function.”

> The reducer function takes two arguments and combines (reduces) them, in some way, into a single return value.

This string reducer function is still quite simple. We’ve just wrapped a binary operator with a binary function to make the syntax feel a bit more familiar.

Our numeric examples would be similarly simple.

```python
add = lambda x, y: x + y
mult = lambda x, y: x * y

add(3,4)  # 7
mult(3,4) # 12
```

I trust that you’re comfortable with the basic concept of combining two things into one new thing via a “reducer function” by now, so let’s expand into some more interesting examples.

# Writing Reducer Functions

I’ll illustrate the breadth of potential use cases for reducer functions by running through a couple of fresh examples.

Here, we’ll insert a (key, value) pair into a JavaScript object.

```js
const myReducerFunction =
      (object, [key, value]) => ({ ...object, [key]: value })

const user = { name: "Nathan" }

const updatedUser = myReducerFunction(user, ["eats", "oats"])

console.log(updatedUser) // { name: "Nathan", eats: "oats" }
```

This is true. I do love oatmeal.

So, we’ve created a reducer function that combines two values: a JavaScript object and an array representing a (key, value) pair. Our function simply creates a new object, adds all of the properties from object, adds our (key, value) pair to the new object, and returns the new object.

It reduces our two values into a single value. Perhaps notably, the two values passed to our reducer function are not of the same type in this example. The first argument is an object and the second is an array. As long as the function knows how to combine the two data types, they can be quite literally any two things that you’d like to combine.

Spoiler alert: Notice that the first argument (an object) is of the same data type as the return value from our reducer function? That will be important later.

Before moving on, let’s do one more example in Python to really build our intuitions about reducer functions.

```python
def my_reducer_function(list1, list2):
  new_list = list1 + list2
  new_list.sort()
  return new_list

all_sorted = my_reducer_function([4,5,1], [3,3,8,0])

print(all_sorted) # [0,1,3,3,4,5,8]
```

In this example, we’re using our reducer function to combine and sort two arbitrary lists. Note that we, once again, create a new list from the two input lists and return the new lists.

We don’t modify either input value directly. This is done intentionally.

In an effort to leverage reduce in the most idiomatic way possible, I would recommend sticking with the foundational principles of Functional Programming, from which reduce/fold evolved. In this case, I’m referring to sticking with pure functions, which – by definition – return new values instead of modifying shared state.

# Using reduce

By this point, you’re probably irritated that we haven’t actually used reduce so far, so let’s change that!

We’ll get into why this works shortly, but we can see the power of reduce from a few examples below.

Let’s use the reduce/fold abstraction to get the sum of a list of numbers in a few different languages.

```python
from functools import reduce

add = lambda x, y: x + y
reduce(add, [1,2,3,4,5,6,7,8,9,10], 0) # 55
```

```haskell
foldl (+) 0 [1,2,3,4,5,6,7,8,9,10] -- 55
```

```js
[1,2,3,4,5,6,7,8,9,10].reduce((x, y) => x + y, 0) // 55
```

They all look a little bit different, but it’s very similar overall. One piece of Haskell syntax that always makes me jealous is the ability to use operators in place of a function name. But I digress…

With reduce, we have a relatively simple concept that can be used in an infinite number of ways. Given a reducer function (add in the cases above), reduce will apply that function to each value in the collection.

> It does this by taking the result of the previous operation and passing it in as the first argument to the reducer function.

It then passes in the current value that is being evaluated as the second argument to the reducer function. This gives it a new accumulated value, which it can pass into the next reducer function invocation.

In this way, it produces a rolling reduction of the list.

---

Our invocations will look like this:

## Step 1

1 is our first element in the list. Since it is an element in the list, it is passed as the second argument to our reducer function. Adding 0 and 1 gives us an accumulated value of 1. Don’t worry about understanding where the 0 came from right now. I will explain that shortly.

```python
# [1,2,3,4,5,6,7,8,9,10]
#  ^

# add(accumulator, value) -> new accumulator
add(0, 1) # 1
```

## Step 2

The reduce function takes the accumulated value and passes it to the reducer function. It also moves from the first element in the list to the second element. This element is 2, which is passed as the second argument to our reducer function. Adding 1 and 2 gives us our new accumulated value.

```python
# [1,2,3,4,5,6,7,8,9,10]
#    ^

# add(accumulator, value) -> new accumulator
add(1, 2) # 3
```

## Step 3

The current accumulated value is 3. So far, we’ve added the first two elements of the list. Next, reduce will once again pass the accumulated value to our reducer function. Since we’ve already handled the first two elements in the list, it will pass the third element in as the second argument.

```python
# [1,2,3,4,5,6,7,8,9,10]
#      ^

# add(accumulator, value) -> new accumulator
add(3, 3) # 6
```

## Step 4

We’ve added 1 + 2 + 3 to get an accumulated value of 6. The fourth element in the list is 4, so that is provided alongside the accumulated value to get the next accumulated value of 10.

```python
# [1,2,3,4,5,6,7,8,9,10]
#        ^

# add(accumulator, value) -> new accumulator
add(6, 4) # 10
```

## And so on…

The pattern that you should start to notice now is:

```python
new_accumulated_value = add(current_accumulated_value, current_value)
```

## Step 10

This pattern continues through the list to the final invocation, where the accumulated value of all previous elements is combined with the last element to complete the reduction:

```python
# [1,2,3,4,5,6,7,8,9,10]
#                    ^

# add(accumulator, value) -> final sum
add(45, 10) # 55
```

The above steps are the essence of how the reduce abstraction works. It is critical that you understand the rolling accumulation of the list in order to grasp the reduce concept.

---

## About that Zero

As promised, I’ll now explain where the zero comes from in our first invocation above.

Consider our input list: [1,2,3,4,5,6,7,8,9,10]

To know what to add to 4, we need to know the sum of the previous numbers (1, 2, 3). To know what to add to 2, we need to know the some of the previous numbers (1).

But how do we know what to add to 1?

Obviously, we don’t want to add anything to 1 because that would make our sum for the list incorrect, but our reducer function still needs a first argument.

We solve this problem by passing another argument to reduce. The first argument is the reducer function. The last argument, which is optional in some languages, is an initial value. It is used in place of the accumulated value when evaluating the first element in the collection.

We chose 0 as the initial value because it does not affect the sum of our list.

# Sample reduce Implementation

For those who understand these concepts better through an implementation in code, below is a potential way that reduce could be implemented in Python. Please note that this is for illustrative purposes only.

```python
def reduce(reducer_function, col, initial_value):
    # The accumulator starts as the initial value
    acc = initial_value

    # Iterate through the collection
    for val in col:
        # Use the reducer function to combine the current
        # accumulator with the current value
        # to get a new accumulator
        acc = reducer_function(acc, val)

    return acc
```

And, for those who prefer a recursive definition, below is a potential implementation written in JavaScript. Again, this is not certified ready-for-production, so please don’t go using it as a polyfill.

```js
const reduce = (reducerFunction, array, initialValue) => {
  const recurse = (reducerFunction, acc, remaining) => {
    // Reached end of input array, return accumulator
    if (remaining.length === 0) {
      return acc;
    }

    // Iterate through array by removing the head
    // and recursing with only the tail
    const [val, ...tail] = remaining;

    // Apply reducer function to the accumulated value
    // and the current value in the input array
    // to get new a new accumulator
    const newAcc = reducerFunction(acc, val);

    // The next invocation receives:
    // - the reducer function
    // - the new accumulator
    // - the remaining array elements to be reduced
    return recurse(reducerFunction, newAcc, tail);
  };

  // Initialize recusive reduce process
  return recurse(reducerFunction, initialValue, array);
};
```

This might be a bit tough to follow if you’re not familiar with recursion, but hopefully it’s otherwise fairly straightforward.

**Note:** You can also reduce from right-to-left instead of left-to-right. I’m using left-to-right here as it is probably more intuitive, but there are situations where it makes more sense to reduce/fold from right-to-left instead. In JavaScript, this is done with reduceRight and is available in Haskell with foldr.

# Terminology

We used a few new terms in the previous sections, so I’d like to outline them explicitly here.

## Reducer Function

The first argument to reduce. It knows how to take two values and combine them. It doesn’t know anything about the collection.

## Initial Value

The last argument to reduce. It is generally the “empty” value for the data type and function being reduced, but it could be any valid first argument to the reducer function. It will be combined with the first element in the input collection.

An “empty” value for adding integers would be 0. For multiplying integers, the “empty” value would be 1. These “empty” values are more formally called the identity, where applying the function to the “empty” value and another value gives you back the other value.

The initial value is passed to the reducer function along with the first element in the collection to produce the accumulator. It is not used again.

If you’re struggling to think of what your initial value should be, look at the first argument to your reducer function. Your initial value needs to be of the same type. Your return value of the reducer function must also be the same type.

> So, if you’re returning an integer from your reducer function but the first argument to the reducer function is a list, you’re going to have problems!

## Accumulator

The first argument to the reducer function. Its starting value is the initial value described above. For all future invocations of the reducer function, it is assigned to the return value of the previous invocation.

# More Complex Reducer Functions

Remember, a reducer function can be anything that knows how to combine two pieces of data. So, let’s get a little more creative and build our intuition about using reduce.

Keep in mind, there is quite literally an innumerable number of ways that you could use reduce, so the examples below will be strictly used for building your intuitions about the abstraction and perhaps providing some inspiration for how you could use reduce in your own projects.

## Build Dictionaries

We could imagine taking a list of (key, value) pairs and combining them into a dictionary. JavaScript, for example, has Object.fromEntries() baked into the language. Let’s do the same sort of thing in Python.

```python
from functools import reduce

entries = [("name", "Yoda"), ("age", 900)]

def add_entry_to_dict(_dict, entry):
  key, value = entry
  _dict[key] = value
  return _dict

from_entries = lambda e: reduce(add_entry_to_dict, e, {})

from_entries(entries) # {'name': 'Yoda', 'age': 900}
```

I should note that idiomatic python prefers list and dictionary comprehensions over using reduce. I’m using Python to illustrate some of these examples because it is a very popular language.

## Compose Booleans

This is a fun one!

Booleans can be composed using the “and” and “or” operators. Because JavaScript and Python don’t allow us to invoke operators as functions, we need to wrap them before they can be used with reduce.

```js
const and = (bool1, bool2) => bool1 && bool2
const or = (bool1, bool2) => bool1 || bool2
```

Looking at the signatures for these helper functions, we can see that they fit the bill of a reducer function. They take two booleans and return one boolean.

So, we can implement a couple of common utility functions using reduce.

```js
const and = (bool1, bool2) => bool1 && bool2
const or = (bool1, bool2) => bool1 || bool2

const all = array => array.reduce(and, true)
const any = array => array.reduce(or, false)

console.log(all([true, false, true])) // false
console.log(all([true, true, true])) // true

console.log(any([true, false, true])) // true
console.log(any([false, false, false])) // false
```

Here, we’ve combined all of the booleans in an array using “and” or “or” to create all and any.

If you’re still getting familiar with reduce, I’d recommend giving some thought to the initial values for each function. Why is the initial value for all true? Why is it false for any?

The reason goes back to what we discussed above: we want an identity as the initial value because, in this case, we want our initial value to disappear during the reduction.

To illustrate the point, consider the left value to be our initial value and the right value to be the first element in the array:

true && true -> true
true && false -> false
false || true -> true
false || false -> false

Notice how the left side (the initial value) doesn’t matter? The second value is always returned from the operation. This is why we chose the initial values that we did for any and all above.

## Compose Functions

This one can be a little bit mind-bending if you haven’t seen something like it before, but it is one of my favourite (though rarely practical) uses for reduce.

Functions can be composed like this:

```js
const add1 = x => x + 1
const multBy5 = x => x * 5

const add1AndMultBy5 = x => multBy5(add1(x))

console.log(add1AndMultBy5(4)) // 25
```

By wrapping add1 in multBy5, we have created a new function that does both. Notably, the inner-most (or right-most) function is applied first. The return value of that function is then provided to the function that wraps it.

Using this principle, we could write our own little compose helper.

```js
// Reducer function applies a function to an argument
const apply = (x, f) => f(x)

// compose accepts functions and returns a new function
// which accepts the initial value for reduce
const compose = (...fns) => x => fns.reduceRight(apply, x)
```

We can use our compose function like this:

```js
const apply = (x, f) => f(x)
const compose = (...fns) => x => fns.reduceRight(apply, x)

const add1 = x => x + 1
const multBy5 = x => x * 5

const add1AndMultBy5 = compose(multBy5, add1)
console.log(add1AndMultBy5(4)) // 25

const doAlot = compose(multBy5, add1, multBy5, add1, add1)
console.log(doAlot(4)) // 155
```

Pretty neat, right?

Notice that I used reduceRight? That’s due to the typical application order for functions in a compose. The right-most function is executed first, and the result is passed from right-to-left. A composition from left-to-right is commonly referred to as a pipe and could be implemented here by swapping out reduceRight with reduce.

# Chaining and Composition

If you’re coming here from the map and filter guides then you were already expecting this section. Like those abstractions, reduce can be chained or composed with itself.

We’ll explore a contrived example of flattening and then summing an array of arrays.

In JavaScript, the ergonomic syntax is dot-chaining.

```js
const nums = [[1,2,3],[4,5,6],[7,8,9], [10]]

const join = (arr1, arr2) => arr1.concat(arr2)
const add = (x, y) => x + y

const sum = nums
    .reduce(join, [])  // [1,2,3,4,5,6,7,8,9,10]
    .reduce(add, 0)    // 55
```

We can see the same thing with a standard function composition syntax in Python.

```python
from functools import reduce

nums = [[1,2,3],[4,5,6],[7,8,9], [10]]

join = lambda l1, l2: l1 + l2
add = lambda x, y: x + y

# Please remember: this is not idiomatic Python.
# I'm using Python here because it's a popular language
flattened = reduce(join, nums, []) # [1,2,3,4,5,6,7,8,9,10]
total = reduce(add, flattened, 0)  # 55
```

The only difference in the Python example is the syntax for composing the functions together. The examples are otherwise the same.

---

Because reduce returns whatever value the reducer function returns, we can chain map and filter onto reduce if we return a collection.

```js
const nums = [[1,2,3],[4,5,6],[7,8,9], [10]]

const join = (arr1, arr2) => arr1.concat(arr2)
const add = (x, y) => x + y

const sum = nums
    .reduce(join, [])         // [1,2,3,4,5,6,7,8,9,10]
    .map(x => x + 5)          // [6,7,8,9,10,11,12,13,14,15]
    .filter(x => x % 2 === 0) // [6,8,10,12,14]
    .reduce(add, 0)           // 50
```

This ability to chain/compose map/filter/reduce is a big part of what makes them such a powerful set of abstractions. To my knowledge, it should be possible to perform any transformation that you could ever need to on a collection by using these three methods, assuming that the collection in question implements them.

# Beyond reduce

What I’ve covered in this article is a guide to the reduce abstraction, but there is more to the concepts of reducing, mapping, and filtering than what you’ve read about in the map, filter, and reduce guides.

Now, don’t freak out! I know it says that this is the “Complete Guide,” and I promise that I’m not holding out on you. The topics beyond reduce get into an even more dynamic abstraction called transducers, which are beyond the scope of a reduce guide.

Transducers rely on a fundamental understanding of how map, filter, and reduce are used, but transducers take the three concepts and smash them together into an even more powerful abstraction.

Since you’re already here, why not check out the [Complete Guide to Transducers](/transducers)? They will bend your brain, making you feel really smart and really dumb at the same time – my favourite!

Anyway, I hope you enjoyed the Complete Guide to reduce. All of the complete guides are living documents, so if I’ve missed something, said something that’s incorrect, or need to clarify my explanation, please leave a comment below.

As always, thanks for reading!
