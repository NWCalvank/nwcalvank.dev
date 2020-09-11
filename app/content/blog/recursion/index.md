---
title: Complete Guide to Recursion
date: "2020-07-24"
description: "I have an unnatural love of recursion."
---

Recursion is one of the more powerful and important principles in programming. In this post, we’ll build up our understanding of recursion from ground-zero in preparation for more advanced concepts, such as recursive data structures and mutual recursion.

Though I won’t assume that you have any prior knowledge of recursion, there are some recommended prerequisites.

If you’ve never written any code before, welcome! But this is probably not the best topic for you to read about right now. Likewise, if you’re not familiar with iteration patterns (ex. for loops), you’re probably better off getting comfortable with those fundamentals first.

Otherwise, I think you’re ready to rock and role (and rock and role and rock and…). Bad jokes aside, let’s begin.

---

### Topics Covered

- Basic Recursive Functions
- Fibonacci – The Classic Recursive Function
- Memory Concerns
- Tail Call Optimization
- Top-Down vs Bottom-Up Implementations
- Memoization

## Basic Recursive Functions

### A Recursive Loop

Looping is one of the most integral programming principles. There are a number of common looping constructions, such as the for and while loops, but we can also loop recursively.

In a language that supports the iterative abstractions, recursive looping is not terribly common, but it is the simplest way to see recursion in action.

Behold! A recursive loop that outputs the numbers from the input up to 5.

```js
const printWhileBelow6 = num => {
  // Output the current num value
  console.log(num);
  // Return num if 5 or above
  // Otherwise, count num + 1
  return num >= 5 ? num : printWhileBelow6(num + 1);
};
```

The obvious feature of a recursive function is that the function invokes itself. In this case, it increments the input and passes it to itself. The new invocation will check to see if the number is at least 5 yet. If it is, the loop will exit.

If you’re not feeling comfortable with the idea of a function calling itself until an exit condition has been reached, I’d recommend copying this function into an editor and toying around with it yourself. You can look at the calls stack, modify the exit condition, and totally change the behaviour, should you choose.

For a step-by-step explanation of building the recursive loop, check out the first half of my introduction to recursive functions video below.

<iframe width="670" height="377" src="https://www.youtube.com/embed/4UbM_AJxZO8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Once you have a good mental model of how a recursive loop is working, we can move on to recursive definitions.

### A Recursive Definition

Something is recursive when it is defined in terms of itself. If that sounds a little crazy, that’s because it is!

But, as it turns out, it’s also super rad.

Now, there’s this bizarre meme in programming where people teach recursion using the Fibonacci sequence, as though that’s the simplest possible example. It’s not.

So, let’s begin with something far simpler. We’ll convert this loop that sums the numbers in an array into a recursive function.

```js
// for loop implementation
const sumForLoop = (nums) => {
  let res = 0
  for (x of nums) {
    res += x
  }
  return res
}

// recursive implementation
const sumRecursive = (nums, res = 0) => {
  // Base case - return final sum
  if (nums.length === 0) {
    return res
  }
  // Pull the first value from nums
  const [x, ...tail] = nums
  // Recursive call
  return sumRecursive(tail, res + x)
}
```

If this is scary, don’t worry. The second function is doing the same thing as the first, so if you can understand the for loop then you’re able to understand the recursive function.

There are two key parts to our recursive function: the base case, and the recursive call.

Our base case stops the recursive loop by exiting when the nums array is empty.

The recursive call allows us to gradually accumulate the res value as we process the array. We know that we want to add the first value in the nums array to res (just like in the for loop function). After that, we want to add the first value in the tail array to res.

Well, as it turns out, we have a function that takes the first value from an array and adds it to res. That function is called sumRecursive!

So, we can simply pass in tail as the new nums value to sumRecursive. We’ll also give it a value for res so that it retains the accumulated sum, and the process will continue until it has passed over the entire array.

With each recursive call, nums.length is decremented, so we know that it will eventually hit the base case. If this were not true, we’d have an infinite recursive loop (translation: not a good thing).

---

Here’s the tl;dr code-to-English translation of sumRecursive:

- The function receives the entire nums array, and sets the initial res value to 0.
- It checks to see if there are any numbers in nums. If there aren’t, it returns res, which is 0 (as it so happens, that’s the sum of an empty array).
- Since nums does have values in it, the first value is taken from it and assigned to x. The rest are collected into a new array called tail.
- The recursive call is made, which provides tail as the new value for nums and res + x as the new value for res.

---

Thinking about a recursive solution in an iterative way, such as repeatedly popping off the first value in an array, can sometimes help as you transition to solving recursive problems. However, problems that are well-suited to recursion are typically far easier to solve recursively than iteratively and should be thought of recursively.

We can think of our “sum of an array” problem in a more recursive fashion as such:

> The sum of an array is the sum of the first two values in the array plus the sum of the rest of the array.

Allow me to refactor the recursive sum function to explicitly reflect this new description.

```js
const sum = ([x = 0, y = 0, ...ys]) => {
  if (ys.length === 0) {
    return x + y
  }
  
  return x + y + sum(ys)
}
```

If you look at line 6, you can see how explicit the recursive logic is here. We’re clearly saying that the sum of an array is “the sum of first two values in the array plus the sum of the rest of the array.”

It’s recursive because the definition of sum includes a use of sum!

We could actually move the addition inside of the recursive call, which is generally preferred.

```js
const sum = ([x = 0, y = 0, ...ys]) => {
  if (ys.length === 0) {
    return x + y
  }
  
  return sum([x + y, ...ys])
}
```

Now, we can see how simple our logic really is. The only thing we have to set up outside of the recursive call is our base case, which tells the recursive function when to stop recursing.

### The Base Case

I would recommend that you always think about your base case early on when writing a recursive function. Not only does this help defend against infinite recursion but it also can help point the rest of your recursive logic in the right direction if you’re having a mental block.

With the sum function, our base case is comparable to a check for nums.length < 3, had we retained a reference to nums instead of destructing the input.

Can you see why this base case is necessary? Or how I came up with it?

We need the base case so that we don’t enter into an infinite recursive loop. If we’d reached the end of the array without telling our function to exit, we’d have kept calling return sum([x + y, ...ys]) until the eventual heat death of the universe.

Ain’t nobody got time for that.

But how did I come up with it?

There are two ways I typically think of my base cases for a recursive function. The first is the one that I already alluded to: asking myself how I know when I’m done.

This assumes starting from a case that will require a recursive call, such as when sum is called with an array of 1 through 10. I would know it’s time to stop recursing when I’ve reached the end of the array, and there are no more numbers to add together. I’ll know that there are no more numbers to add together when there are only two numbers left to add together.

The other way that I’ll generally come up with a base case is the one that I tend to prefer, which is thinking of how I would handle the minimal or empty cases.

When calculating the sum of an array, I know that I can just return 0 if I’m given an empty array. If I’m given an array with a length of 1, I can return the only value in that array. If I’m given array array of length 2, I can return the two values in the array, added together. Beyond that, I’d probably want to recurse.

This way of thinking about a problem lends itself well to pattern matching in languages that support it, such as Haskell.

In the case of implementing the sum function, I recognized that I could combine all three of those initial cases into one if I could just set initial values for the first two elements in the array.

- Empty: 0 + 0 = 0
- One element (5): 5 + 0 = 5
- Two elements (5, 6): 5 + 6 = 11

By covering all of these potential inputs with our base case, we’re able to safely recurse for all larger inputs. How neat is that?

## Fibonacci

Now that we’ve gotten our feet wet with a fairly simple recursive function, we can see how recursion could be used in place of an iterative (for loop) implementation.

While it’s true that any recursive solution can be rewritten in an iterative way, there are many problems that are more naturally-suited to recursion. This is particularly the case for readability.

A common signal that you should consider a recursive solution to a problem is when you’re dealing with a recursive data structure, for example, such as a linked list or a binary tree.

For now, let’s consider another type of problem that is well-suited for recursion: problems that can be easily defined in terms of themselves.

The very definition of a Fibonacci number is recursive: it is the sum of the previous two Fibonacci numbers.

Translated into a formula, the “nth” Fibonacci number is:
fib(n - 1) + fib(n - 2)

Knowing this, all we need is a base case, and we have a recursive function for calculating Fibonacci numbers!

```js
const fib = (n) => {
  // Base case - first 2 Fibonacci numbers are 1
  if (n < 3) {
    return 1
  }
  
  return fib(n - 1) + fib(n - 2)
}
```

Believe it or not, it’s that easy.

Let’s walk through it with a simple example.

```js
fib(4) // 3

// First invocation -> n = 4
// fib(4 - 1) + fib(4 - 2)
//   fib(3)
//     fib(3 - 1) + fib(3 - 2)
//       fib(2)
//         1
//     1 + fib(1)
//   1 + 1
// The left side has now been totally evaluated
// 2 + fib(2)
//   2 + 1
// returns 3
```

We start from 4, which skips the base case and triggers the left-most recursive call. This time, n is 3, which still skips the base case, triggering the left-most recursive call again, where n is 2.

At 2, n hits the base case and evaluates to 1. We now have a value to add to fib(3 - 2), which triggers a recursive call where n is 1. This evaluates to 1, giving us 1 + 1. So, the result of our initial recursive call fib(4 - 1) is 1 + 1, or 2.

We can then move on to the right-most recursive call of fib(4 - 2). When n is 2, it hits the base case, returning 1. We can now evaluate 2 + 1, which gives us our answer.

If that is confusing to you, you’re not alone. Many people initially find recursion to be quite mind-bending. I still confuse myself sometimes.

The key thing to remember is that, unlike the computer, you don’t need to hold everything in your head at once. To understand a recursive function, you really just need to be able to understand the base case and the reason for the recursive call.

In this example, we definitely understand the base case – the first two Fibonacci numbers are both 1. And the Fibonacci sequence is literally defined by our recursive call, so we can likely understand that part as well.

It’s sometimes helpful to walk through some simple examples (where n is 1, 2, 3, 4), understanding each step. If you’re anything like me, you’ll find that recursion is easiest to understand when you’ve had some time to work with it across a number of examples. As your intuition builds, your mental models for how it all works under-the-hood will become stronger.

One piece of advice I would have, for anyone struggling with this, is to try writing down the recursive calls. It can become confusing and difficult trying to remember where you’re at, but it’s generally quite easy when you’ve written it down.

Remember: recursive logic does not change as the input grows. If you understand fib(1), fib(2), fib(3), and fib(4), you don’t also need to manually walk through each step of greater n values to understand what’s happening. The logic is the same; it just gets progressively more difficult for humans to understand. When it comes to computing larger inputs, I’d rather just leave it to the machines.

## Memory Concerns

Due to Tail Call Optimization being rejected from most JavaScript engines (I cry every time…), recursion is not as memory efficient as iterative solutions. This is the case for many popular languages, including Python.

To understand why memory can be a serious concern when dealing with recursion, we need only look back at our Fibonacci example. It’s quite the memory hog.

For every value of n that doesn’t satisfy the base case, two recursive calls are made. This, again, is recursive, meaning that those recursive calls can each trigger two more recursive calls.

Because we’re not caching the Fibonacci sequence as we go, we wind up recalculating every single value up to n for every single recursive call. We’ll get to memoization later to resolve this.

In the meantime, let’s try to understand how bad our call stack can become as an illustration of our memory concerns.

Every recursive call adds a frame to the call stack. In our sum example, this would mean that the call stack size would wind up being equal to the length of the input. So, the memory consumption, with respect to the call stack, scales linearly with the input – O(n).

This is in contrast to the memory consumption of an iterative sum, which does not change based on the size of the input – O(1).

Looking at our current fib implementation, the call stack size is also linear, but the total number of frames required relative to n is far worse than in sum. Every function invocation that skips the base case results in 2 more recursive calls. This gives us a time complexity of O(2^n), where n is the “nth” Fibonacci value.

That is bananas 🍌🍌

![The Call Stack is Too Damn High](./the-call-stack-is-too-damn-high.png)

We need to do better. Let’s discuss how we can.

## Tail Call Optimization

### Preface

If your language of choice supports Tail Call Optimization (TCO) then proper tail calls are absolutely the first, and arguably best, way to solve the problem of a growing call stack.

The ES2015 (ES6) JavaScript spec supports TCO, but – at the time of writing – Safari is the only browser that has implemented it. Other common languages that do not support TCO include Python, Ruby (though it can be enabled in some implementations), PHP, and Go.

Some languages that do support TCO include Haskell, Scheme, and Elixir.

You’ll notice that the languages which support TCO are not terribly common. Honestly, if it weren’t for the ES2015 spec including TCO, I’m not sure that I would be discussing it here. But its inclusion in the ES spec normalizes the concept enough in my eyes that everyone interested in recursion should be aware of it.

### What is TCO?

TCO is an optimization that leverages proper tail calls to avoid unnecessary call stack growth. We’ll begin by discussing what the optimization is, and then we’ll look at how you can implement a proper tail call in your own code.

Without TCO, a recursive function call retains the execution context of the calling function. This means that the previous invocation stays on the call stack while the recursive call runs. We’ve seen from the previous section that this leads to a growing call stack.

However, we can see from our sum example that retaining the previous execution context is unnecessary.

```js
const sum = ([x = 0, y = 0, ...ys]) => {
  if (ys.length === 0) {
    return x + y
  }
  
  return sum([x + y, ...ys])
}

// Initial invocation
sum([1,2,3,4,5,6,7,8,9,10]) // 55

// First recursive call
sum([3,3,4,5,6,7,8,9,10]) // 55

// Second recursive call
sum([6,4,5,6,7,8,9,10]) // 55

// Third recursive call
sum([10,5,6,7,8,9,10]) // 55

// etc...
sum([15,6,7,8,9,10]) // 55
sum([21,7,8,9,10]) // 55
sum([28,8,9,10]) // 55
sum([36,9,10]) // 55
sum([45,10]) // 55 (hits base case)
```

Do you see how each recursive call has all of the information that it needs to complete its task?

Every invocation of sum is entirely self-contained. It doesn’t need to remember that the previous invocation was given a slightly longer input array. None of the previous state is required.

When a recursive function has this trait, a language supporting TCO is able to optimize the call stack by removing the previous invocation while adding the next invocation to the call stack. In other words, there only ever needs to be one or two sum frames on the stack at a time.

Without TCO, this sum example would create a call stack with 9 sum frames. The 9th context would return 55, which would be passed to the eighth context, which would return that same 55, which would be passed to the seventh context, etc.

From what I’ve read, the decision to exclude TCO from most popular language implementations is based on retaining the call stack for debugging purposes. If you’re removing the reference to the previous execution context with each recursive call, you are not able to access the original stack trace in the event of an error.

Admittedly, I have not run into this as a legitimate problem when writing recursive functions. Tracking previous state is typically possible with a naive print that dumps whatever values you want from each invocation.

Due to the way recursive logic works, it can generally be tested with small, easily-understood inputs. This logic then scales up without any noteworthy changes as the input grows in size and/or complexity. For this reason, I’m not currently convinced that retaining a full stack trace justifies rejecting TCO.

### Tail Call Position

Personally, even if the language that I’m working with doesn’t support TCO, I often find myself gravitating toward writing proper tail calls anyway. The times when I don’t is typically for the benefit of readability.

Tail Call Position (TCP) is the position where a recursive call must be made for the recursive call to be considered a proper tail call. A proper tail call provides all of the necessary information to the recursive function such that the previous execution context could be completely destroyed without affecting the result of the current invocation.

Let’s look at our sum function from the previous section, which used a proper tail call.

```js
const sum = ([x = 0, y = 0, ...ys]) => {
  if (ys.length === 0) {
    return x + y
  }
  
  return sum([x + y, ...ys])
}
```

Now, compare this to an earlier implementation, which does not use a proper tail call.

```js
const sum = ([x = 0, y = 0, ...ys]) => {
  if (ys.length === 0) {
    return x + y
  }
  
  return x + y + sum(ys)
}
```

Notice how this implementation doesn’t pass all of the state to the recursive function call?

The previous execution context holds the x and y values, so that context must be retained while the sum(ys) is evaluating. We can see how this differs by looking at the execution steps for this function.

```js
// Initial invocation
sum([1,2,3,4,5,6,7,8,9,10])

// First recursive call
1 + 2 + sum([3,4,5,6,7,8,9,10])

// Second recursive call
3 + 4 + sum([5,6,7,8,9,10])

// ect.
5 + 6 + sum([7,8,9,10])
7 + 8 + sum([9,10])
9 + 10

// Call stack begins to shrink as recursive calls evaluate
// x + y + sum([ ... ])
7 + 8 + 19
5 + 6 + 34
3 + 4 + 45
1 + 2 + 52
55
```

Hopefully, the difference between these two sum implementations has made TCO and proper tail calls quite straightforward.

> A recursive function that uses proper tail calls passes all of the necessary state into the recursive call.

A function that does not use a proper tail call must retain the previous execution context to finish evaluating. For this reason, it cannot be optimized with TCO.

Phrased differently, tail call position is the syntactic location wherein the recursive function call will be the last thing to evaluate inside of the current execution context, such that the execution context could be destroyed as soon as the recursive function is added to the call stack.

### Proper Tail Calls with Fibonacci

The nice thing about our sum function is that it is rather simple: a single recursive call makes understanding the basics of a proper tail call relatively straight forward. Let’s look now to our fib function, which throws an airbrush at our mental model.

Is this function using proper tail calls?

```js
const fib = (n) => {
  // Base case - first 2 Fibonacci numbers are 1
  if (n < 3) {
    return 1
  }
  
  return fib(n - 1) + fib(n - 2)
}
```

Based on what we know so far, it looks like it, right?

When we invoke the fib function initially, it is given a single number. Each of our recursive calls also gives it a single number. One could assume, based on our current understanding of proper tail calls, that these recursive fib call sites are in tail call position.

Of course, because I’m writing this section, they are not. To understand why, we need to look a bit more carefully at the execution context and the final paragraph of the previous section.

Because we have two recursive function calls in the same expression, they can’t both be the final expression to evaluate. Because we are asking the program to combine the results of two function invocations to get the return value of the original execution context, the original execution context cannot be destroyed.

With that said, we can rewrite fib to use proper tail calls. We just need to be a little bit more creative.

```js
const fib = (n, curr = 0, prev = 1) => {
  if (n <= 0) {
    return curr
  }
  
  return fib(n - 1, curr + prev, curr)
}
```

So, we’ve now updated fib to use a proper tail call. To achieve this change, we’ve transformed fib(n - 1) + fib(n - 2) into curr + prev, using those two local variables to hold the state of the previous iteration(s). In this version, curr is behaving like an accumulator, comparable to res in our sum example from early on, and prev simply holds the previous curr value.

With the state captured and passed along with each recursive call, we are able to destroy the previous execution context. In other words, the engine could now perform TCO, should the engine support it.

## Top-Down vs Bottom-Up

The eagle-eyed among you may have noticed another effect of our new fib function. Instead of starting from n and recursing down to the base case, the new fib starts from 1 (the first Fibonacci number) and builds up to the nth value.

Even without TCO, this has a remarkable performance benefit because we’re no longer repeating work. Each invocation is based on the result of the previous invocation, instead of each invocation being required to evaluate before the previous invocation can evaluate.

We’re now completing with linear space and time complexity. With TCO, this drops to constant space and linear time.

Let’s walk through an invocation of the new fib to see how it differs.

```js
fib(6)

// Initial invocation
// fib(5)

// Subsequent recursive calls: fib(n - 1, curr + prev, curr)
// fib(5 - 1, 0 + 1, 0)
// fib(4 - 1, 1 + 0, 1)
// fib(3 - 1, 1 + 1, 1)
// fib(2 - 1, 2 + 1, 2)
// fib(1 - 1, 3 + 2, 3)
// fib(1 - 1, 5 + 3, 5)

// Base case satisfied
// return 8
```

Notice how the curr + prev creates the next Fibonacci number, and curr gets passed in as prev for the next invocation?

Since the Fibonacci sequence is based exclusively on the previous two numbers, that’s all the state that we need to pass to the next invocation. We can see the sequence being built in the second and third argument positions in our (upside down) call stack above.

From that call stack, it’s likely fairly obvious how the bottom-up concept is functioning here. We start from the case where n = 1, where there is no previous value and the current value is 0. From there, we build up our sequence until we’ve reached the appropriate “nth” number.

Our original fib implementation uses a top-down approach. In that function, we start from n = 6, for example, and know that it is the result of fib(5) + fib(4), which must then request the values of fib(3), fib(2), and fib(1). We recurse “down” instead of “up.”

Our bottom-up approach avoids redoing work because one new Fibonacci number is generated from each function invocation without the need to recalculate any previous Fibonacci numbers. By comparison, the top-down approach requires duplicating work because fib(n - 1) and fib(n - 2) will frequently overlap.

For example, fib(5) and fib(4) will both require the result of fib(3), which will be executed in both instances.

Sometimes, we may prefer a top-down solution. As we’ll see with memoization, a cache that lives across multiple function invocations will make all future fib calls more efficient. In such a case, if the function will be called repeatedly and the top-down strategy is more readable, it might be preferred over a bottom-up implementation.

Notably, our bottom-up implementation doesn’t duplicate work within a single function call, but it will start over from n = 1 every time that we call it. Of course, these results could also be cached for future function invocations, giving us the same performance gains as a memoized top-down approach.

## Memoization

Most simply, memoization is function-specific caching. To avoid redoing work, we’ll toss a previous function result into a cache, which we can reference later for a constant-time lookup.

Let’s begin by memoizing our top-down fib function.

It might not seem like this would be useful at a first glance. For example, you might think that fib(3) will still be called for fib(5) and fib(4), so how could this give us a performance improvement?

We have to remember that our base case requires n to be less than 3, so any greater value of n will result in recursive calls. That is, unless we have a cached result for n. If the nth Fibonacci number lives in the cache, it will be immediately returned (no recursive calls required).

Let’s take a look at memoization in our original, top-down fib function.

```js
// Our local cache
const memo = {}

const fib = (n) => {
  // Base case - first 2 Fibonacci numbers are 1
  if (n < 3) {
    return 1
  }
  
  // Memoization :D
  if (memo[n] !== undefined) {
    // We know the nth Fibonacci
    return memo[n]
  }
  
  // Check cache
  let first = memo[n - 1]
  if (first === undefined) {
    // Populate cache
    memo[n - 1] = fib(n - 1)
    first = memo[n - 1]
  }
  
  // Check cache
  let second = memo[n - 2]
  if (second === undefined) {
    // Populate cache
    memo[n - 2] = fib(n - 2)
    second = memo[n - 2]
  }
  
  return first + second
}
```

This is a fairly simple change for a big performance benefit!

We’ve taken our runtime from O(2^n) to O(n).

If you’re not convinced of how beneficial this change is, allow me to illustrate with an example.

If we call fib(12) without memoization, there will be 287 function invocations required to calculate that the 12th Fibonacci number is 144. With memoization, the same fib(12) function results in 12 function invocations.

As an added benefit, any future invocation of fib where n <= 12 will return immediately, and values greater than 12 will skip calculating the first 12 values.

That’s bananas! 🍌🍌 (but in a good way this time)

---

## Thanks for Reading!

This has been a general overview of recursion, explained through JavaScript examples. I hope you’ve found it useful and/or enjoyable, even if you don’t love recursion as much as I do.

Now, recursion has much more to offer us, but I’m going to split those into separate articles that will focus on topics such as recursive data structures and mutual recursion.

As a bit of parting advice, I would suggest that you only use recursion when it’s obvious that the problem you’re solving lends itself well to recursion. As we’ve seen, recursion can introduce considerable performance concerns if you’re not careful. Built-in abstractions, such as [reduce](/reduce), are often a safer and more-approachable way of implementing the same logic.

If you’re working in a language that doesn’t support TCO, I would highly recommend sticking with an iterative solution unless you know the maximum size of the input.

For illustration purposes, here are a few places that I’ve used recursion in real applications:

- Traversing related objects via an ORM
- Generating a nested folder dropdown picker of arbitrary depth
- Manually pre-processing a Python dictionary for safe JSON serialization

In other words, I love recursion, but I don’t wind up using it all that often.
