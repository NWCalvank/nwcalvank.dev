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

# Complete Guide to filter

**June 17th, 2020**

---

We use a variety of collections to store our data in the programs that we write. There may be a list of users returned from a database query or a dictionary to represent a person’s address.

In many situations, though, we don’t want to operate on all of the users in our list. Perhaps we just want the female users or the users who are over a particular age. Stripping out unwanted data from a collection is such a common task that nearly all modern, high-level programming languages provide an abstraction for this as part of the core library.

As you might expect, this abstraction is commonly called `filter`.

# Comparison to a for loop

If you come from a more imperative programming background, you may be saying something like “why would I want a filter function for something that I can do with a standard for loop?”

This is a totally fair question to ask. For loops are likely the most common pattern for iteration through a collection. They are incredibly flexible, so anything that you’d choose to do with a filter can also be done with a for loop. However, this flexibility comes at the cost of expressiveness.

You can think of filter as a for loop that has agreed to follow a set of rules. By knowing these rules and choosing to use a filter function in place of a for loop, we help to signal our intentions to future developers (including our future selves).

Let’s compare a couple of examples to illustrate this point.

> Don’t worry if these example don’t make sense right away. I’m providing them early on for those who learn best through examples. We’ll explain the concepts more a bit later.

We will first use a for loop and then a filter function to create a new list of even numbers from an initial list of even and odd numbers.

```js
const nums = [1,2,3,4,5]
const evenNums = []

const isEven = x => x % 2 === 0

for (num of nums) {
  if (isEven(num)) {
    evenNums.push(num)
  }
}

console.log(nums)     // [1,2,3,4,5]
console.log(evenNums) // [2,4]
```

```python
nums = [1,2,3,4,5]
even_nums = []

is_even = lambda x: x % 2 == 0

for num in nums:
  if is_even(num):
    even_nums.append(num)

print(nums)      # [1,2,3,4,5]
print(even_nums) # [2,4]
```

And now, the same logic using a filter function.

```js
const nums = [1,2,3,4,5]

const isEven = x => x % 2 === 0

const evenNums = nums.filter(isEven)

console.log(nums)     // [1,2,3,4,5]
console.log(evenNums) // [2,4]
```

```python
nums = [1,2,3,4,5]

is_even = lambda x: x % 2 == 0

even_nums = list(filter(is_even, nums))

print(nums)      # [1,2,3,4,5]
print(even_nums) # [2,4]
```

Conceptually, this is quite simple.

1. We start with an Array or List of numbers.
2. We pass that initial array into the filter function, along with a function that determines whether the number should be included or excluded (more on that later).
3. We get back a new Array or List of numbers.

An important thing to note is that our original collection is left in-tact. In other words, filter is intended to be used as a pure operation, creating a new collection instead of modifying the existing one.

The benefit of using filter instead of a for loop may not be crystal clear at this point because the example is so simple. What I’m attempting to do is illustrate how the code snippets that use filter are more expressive of their intentions. In their declarative form, they say “give me back the elements in nums that would satisfy the condition of being even.”

This is compared with the for loops, which – while being quite easy to follow – do not signal their intentions quite so loudly. This is because they describe how something should be done, where a filter function more clearly communicates what should be done.

This expressive way of communicating intent makes the life of future developers much easier because, even if there is a bug, we can more clearly see what the filter function is trying to do.

# What is filter?

filter is a higher-order function, which means that it can accept another function as an argument. In the case of filter, this function is called a predicate. In the examples above, we used a predicate function to remove all of the odd numbers from our collections.

> A predicate function is a function which returns a boolean based on the input value. It describes a relationship between the incoming value and some condition.

Our predicate functions above tested each value in the nums collection against the condition of being even. Numbers that failed that condition (by being odd) would lead the predicate to return false. Numbers that satisfied that condition would, in turn, lead the predicate to return true.

The filter function then accepts these boolean values and handles the insertion (or not) of those values into the new collection.

In this way, filter knows how to access the values inside of the collection, how to apply a function to those values, and how to create a new collection from the result of applying the predicate function to those values. It does not, however, know anything about the values themselves.

Likewise, much like the transformation function passed to map, the predicate function passed to filter knows about values, but it doesn’t know about the collection in which those values live. It relies on filter to access those values.

We could imagine an implementation of filter for Arrays/Lists that looks like this.

```js
const filter = (predicate, array) => {
  const newArray = []
  for (val of array) {
    if (predicate(val)) {
      newArray.push(val)
    }
  }
  return newArray
}

const isEven = x => x % 2 === 0

const evenNums = filter(isEven, [1,2,3,4,5])

console.log(evenNums) // [2,4]
```

```python
def filter(predicate, _list):
  new_list = []
  for val in _list:
    if predicate(val):
      new_list.append(val)
  return new_list

is_even = lambda x: x % 2 == 0

even_nums = filter(is_even, [1,2,3,4,5])

print(even_nums) # [2,4]
```

As we can see, filter doesn’t know or care what predicate does to val or what val‘s value is. It just knows how to apply predicate to each val in the input collection to create a new collection of the same type.

It’s possible to create a filter function that returns the correct collection type based on the input, but we’ll just assume a naive implementation strictly for Arrays/Lists here.

# The Rules of filter

These rules will be very familiar if you’ve read the [Complete Guide to map](/map). The map and filter functions have many things in common, with the only real difference being the decision of what to do with the new value that their input function creates. map passes the transformed value into the new collection, whereas filter passes the original value into the new collection if the transformed value was true.

The rules of filter:

- There must always be a return value
- The return value collection type must always be the same as the input collection type
- Every value in the collection will be visited once
- The predicate function will be given one value at a time as its input
- Only values that satisfy the predicate will be added to the returned collection

This can be largely, though not completely, summarized with a type definition. I’ll use a Haskell-style definition to describe filter.

```haskell
filter :: (a -> Bool) -> f a -> f a
```

This says, in a very succinct way, that the filter function accepts, as its first argument, a predicate function that accepts a value of type a (ex. a number) and returns a boolean. filter accepts, as its second argument, a collection of type f (ex. an Array or List) of type a.

Using these two inputs, filter then returns a new collection of the same type (f) that contains values of type a. If you give filter an Array of strings, you know that you will get back an Array of strings.

# Filtering collections of collections

So far, we have looked at examples where we removed all of the odd values from an collection. In the real world, we are often dealing with more complex data structures than arrays of numbers.

Suppose, for example, that we received this JSON response from an API.

```
{
  count: 5,
  results: [
    {id: 1, name: "Luke", sex: "M", species: "human"},
    {id: 2, name: "Leia", sex: "F", species: "human"},
    {id: 3, name: "Han", sex: "M", species: "human"},
    {id: 4, name: "Chewbacca", sex: "M", species: "wookiee"},
    {id: 5, name: "R2D2", sex: null, species: "droid"},
  ]
}
```

From this JSON object, we want a list of only the male characters. We can simply apply the same principles that we used in our earlier examples to produce this result. All we need is a different predicate function.

```js
// Assume resp is the JSON response above
const isMale = character => character.sex === "M"

const males = resp.results.filter(isMale)

console.log(males)
/* [
 *   {id: 1, name: "Luke", sex: "M", species: "human"},
 *   {id: 3, name: "Han", sex: "M", species: "human"},
 *   {id: 4, name: "Chewbacca", sex: "M", species: "wookiee"}
 * ]
 */
```

The males variable now points to an array of all of the male characters from our JSON response.

Let’s do one more example. We’ll start with a List of Lists and filter out any that have a sum greater than 5.

```python
lists = [[1], [1,2,3], [5], [1,1,1,1,1,1], [7, -3]]

small_sum = lambda xs: sum(xs) <= 5

new_lists = list(filter(small_sum, lists))

print(new_lists) # [[1], [5], [7, -3]]
```

Hopefully it is very clear at this point that your ability to filter is only limited by your ability to provide the appropriate predicate, regardless of the data type you’re working with.

# Chaining / Composition

Let’s return to our Star Wars example and imagine that we wanted a list of the male human characters. Your first thought might be to do something like this.

```js
const isMale = character => character.sex === "M"
const isHuman = character => character.species === "human"

const males = resp.results.filter(isMale)
const humanMales = males.filter(isHuman)

console.log(humanMales)
/*
 * [
 *   { id: 1, name: 'Luke', sex: 'M', species: 'human' },
 *   { id: 3, name: 'Han', sex: 'M', species: 'human' }
 * ]
 */
```

This does the job, but there is a more ergonomic way of accomplishing the same thing: composition. In JavaScript, composition of filter methods can be easily done with dot-chaining.

```js
const isMale = character => character.sex === "M"
const isHuman = character => character.species === "human"

const humanMales = resp
                     .results         // all characters
                     .filter(isMale)  // all males
                     .filter(isHuman) // all human males

console.log(humanMales)
/*
 * [
 *   { id: 1, name: 'Luke', sex: 'M', species: 'human' },
 *   { id: 3, name: 'Han', sex: 'M', species: 'human' }
 * ]
 */
```

We can avoid creating the intermediary variable by composing our two filter calls together into a single chain. This is syntactically better, but it may still have negative performance implications.

If we’re leveraging a naive compiler, it’s possible that we are still going to create an intermediary Array of every male character. We will then iterate through that Array again to remove all of the non-human characters. It’s possible that a compiler will optimize this for us, but it’s also quite simple for us to make that optimization in the source code.

To avoid creating the intermediary Array and iterating through it a second time, we can compose our predicate functions into a single predicate.

```js
We can avoid creating the intermediary variable by composing our two filter calls together into a single chain. This is syntactically better, but it may still have negative performance implications.

If we’re leveraging a naive compiler, it’s possible that we are still going to create an intermediary Array of every male character. We will then iterate through that Array again to remove all of the non-human characters. It’s possible that a compiler will optimize this for us, but it’s also quite simple for us to make that optimization in the source code.

To avoid creating the intermediary Array and iterating through it a second time, we can compose our predicate functions into a single predicate.
```

With this simple change, we have both reduced the space and time complexity of our filtering operation. We now pass each character through the two conditions at the same time.

Instead of removing all of the non-male characters and then removing all of the non-human characters, we remove all of the non-male, non-human characters in one iteration through the Array. No intermediary Array is created either!

We can make the same optimization in Python without dot-chaining syntax.

```python
isMale = lambda character: character["sex"] == "M"
isHuman = lambda character: character["species"] == "human"

humanMales = list(
  filter(isHuman,
    filter(isMale, resp["results"])))

print(humanMales)
 # [
 #   { id: 1, name: 'Luke', sex: 'M', species: 'human' },
 #   { id: 3, name: 'Han', sex: 'M', species: 'human' }
 # ]
```

Python uses a traditional, Lisp-like call signature, but the logic is the same as with the JavaScript dot-chaining example above. We start with our results, which is a list of every character.

We then filter out all of the non-male characters. This filtered collection gets passed to the next filter, which removes all of the non-human characters, and we’re left with a list of male, human characters.

Now, let’s compose the filters together into a single step.

```python
isMale = lambda character: character["sex"] == "M"
isHuman = lambda character: character["species"] == "human"

isMaleHuman = lambda character: isMale(character) and isHuman(character)

humanMales = list(
  filter(isMaleHuman, resp["results"]))

print(humanMales)
 # [
 #   { id: 1, name: 'Luke', sex: 'M', species: 'human' },
 #   { id: 3, name: 'Han', sex: 'M', species: 'human' }
 # ]
```

# Use with map

If you’ve read the [Complete Guide to map](/map), you will probably recognize the above performance optimization. As I’ve alluded to throughout this article, map and filter have many similarities. Separately, they can help us clearly and intuitively work with collections.

But, because of these similarities, they can also be used together. Suppose that we only wanted the names of the male, human characters. How could we do it?

Conveniently, we can do this:

```js
const isMale = character => character.sex === "M"
const isHuman = character => character.species === "human"
const isMaleHuman = character => isMale(character) && isHuman(character)

const getName = character => character.name

const humanMaleNames = resp
                         .results              // all characters
                         .filter(isMaleHuman)  // all human males
                         .map(getName)         // human male names

console.log(humanMaleNames) // [ "Luke", "Han" ]
```

```python
is_male = lambda character: character["sex"] == "M"
is_human = lambda character: character["species"] == "human"
is_male_human = lambda character: is_male(character) and is_human(character)

get_name = lambda character: character["name"]

human_male_names = list(
  map(get_name,
    filter(is_male_human, resp["results"])))

print(human_male_names) # [ "Luke", "Han" ]
```

In functional programming, it’s common to bundle these compositions up into a separate function for reuse, testability, and readability.

```js
const isMale = character => character.sex === "M"
const isHuman = character => character.species === "human"
const isMaleHuman = character => isMale(character) && isHuman(character)

const getName = character => character.name

const getMaleHumanNames =
      (characters) =>
          characters
            .filter(isMaleHuman)  // all human males
            .map(getName)         // human male names

const humanMaleNames = getMaleHumanNames(resp.results)

console.log(humanMaleNames) // [ "Luke", "Han" ]
```

```python
is_male = lambda character: character["sex"] == "M"
is_human = lambda character: character["species"] == "human"
is_male_human = lambda character: is_male(character) and is_human(character)

get_name = lambda character: character["name"]

get_male_human_names = lambda chars: list(
  map(get_name,
    filter(is_male_human, chars)))

human_male_names = get_male_human_names(resp["results"])

print(human_male_names) # [ "Luke", "Han" ]
```

Hopefully, you’re able to see from these small examples how beneficial the map and filter abstractions can be for simplifying our code. They allow us to write smaller, easily testable transformation and predicate functions that can be composed together to create more complex systems.

Again, yes, this can all be accomplished with a more imperative programming style, but these abstractions are useful for maximizing your code’s clarity, which allows you to more directly communicate your intentions to future developers.

# Filtering on Custom Data Types
In the [Complete Guide to map](/map), we looked at Functors and implemented our own. Since different people learn in different ways, I thought that it might be useful to do the same thing here by building a custom data type that implements a filter function. We will then pass our custom data type through the isMaleHuman predicate to see the power and flexibility of leveraging these functional programming abstractions.

We’ll make a simple, Array-like object with custom indexes. I promise it looks like a lot more than it really is.

```js
const Filterable = {
  of: function(...xs) {
    // Create a new instance
    const newFilterable = Object.assign({}, Filterable)
    newFilterable.length = 0
    // Populate the instance
    for (i in xs) {
      newFilterable[`item-${i}`] = xs[i]
      newFilterable.length += 1
    }
    // Return the instance
    return newFilterable
  },
  filter: function(p) {
    // Create a new instance
    const newFilterable = this.of()
    let i = 0
    while (i < this.length) {
      // Conditionally populate the new instance
      if (p(this[`item-${i}`])) {
        newFilterable.add(this[`item-${i}`])
      }
      i += 1
    }
    // Return the new instance
    return newFilterable
  },
  add: function(item) {
    // Add the new item to "end" of list
    this[`item-${this.length}`] = item
    this.length += 1
  }
}
```

Above is an initial instance of a Filterable object. We can use this as though it were a class, in JavaScript’s semi-class-based style, via the .of() method.

```js
const myFilterable = Filterable.of(...resp.results)

console.log(myFilterable)
/*
 * {
 *   of: [Function: of],
 *   filter: [Function: filter],
 *   add: [Function: add],
 *   length: 5,
 *   'item-0': { id: 1, name: 'Luke', sex: 'M', species: 'human' },
 *   'item-1': { id: 2, name: 'Leia', sex: 'F', species: 'human' },
 *   'item-2': { id: 3, name: 'Han', sex: 'M', species: 'human' },
 *   'item-3': { id: 4, name: 'Chewbacca', sex: 'M', species: 'wookiee' },
 *   'item-4': { id: 5, name: 'R2D2', sex: null, species: 'droid' }
 * }
 */
```

So, now we have an instance of Filterable that contains our Star Wars characters. Let’s get the male humans from this collection with the same predicate function that we used before.

```js
const myFilterable = Filterable.of(...resp.results)
const humanMales = myFilterable.filter(isMaleHuman)

console.log(humanMales)
/*
 * {
 *   of: [Function: of],
 *   filter: [Function: filter],
 *   add: [Function: add],
 *   length: 2,
 *   'item-0': { id: 1, name: 'Luke', sex: 'M', species: 'human' },
 *   'item-1': { id: 3, name: 'Han', sex: 'M', species: 'human' },
 * }
 */
```

We actually don’t even need to create the myFilterable intermediary variable if we don’t want to.

```js
const humanMales = Filterable.of(...resp.results).filter(isMaleHuman)
```

There we have it!

I admit, the Filterable “class” is not the most elegant data structure you’ll ever work with, but the concept holds true. We were able to create an entirely new data structure to serve as our collection, give it an implementation of filter and then re-use our existing predication function.

This worked because the predicate only cares about the data type of each individual element stored in a collection. It doesn’t know anything about the collection or how that data is represented; filter takes care of that.

Since we stuck with our Star Wars characters, the data type of each element hadn’t changed, and the predicate function was still happy. Then, because our implementation of filter knew how to apply the predicate function to each element, everything worked out just as it did with an Array.

Hopefully, this example helps to further illustrate how filter works and maybe sparked some ideas in your head about how you could use it in your code as well.

# Next up...

That’s it! You’ve mastered filter (maybe? kinda?).

Now, it’s time to either learn about transforming the values in a collection if you haven’t yet read the [Complete Guide to map](/map).

If you already know why map is so rad, I’d suggest realizing the remarkable power of combining values in the [Complete Guide to reduce](/reduce).
