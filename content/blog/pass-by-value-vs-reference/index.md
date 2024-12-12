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

# Pass by Value vs Reference

**September 2nd, 2020**

---

There are a few key programming concepts that can be tough to wrap your mind around early on. For some people, it’s asynchronous code. For others, it may be [recursion](/recursion). For me, for whatever reason, I struggled to fully understand the difference between pass-by-reference and pass-by-value.

I could pay lip service to the idea and sort of sound like I knew what was going on, but that was part of the problem. The language was so overloaded that anyone who understands it often feels satisfied with the explanation of “well, passing by reference is just where you pass a reference to the thing instead of the thing itself, you know”?

The funny thing is that it’s such an obvious concept once it sinks in that I’m almost satisfied with that answer.

Today, I’ll be attempting to travel back in time to a day when my brain did not yet understand how passing by-reference differed from passing by-value. We’ll be using simple examples to illustrate the point.

# Passing Variables

Before we worry about how we’re passing something, we should quickly ensure that we’re all on the same page about what it means to “pass” something.

When writing software, we can pass variables around to represent a value – known or unknown.

Here is an example of a variable with a known value at write-time:

```js
const myNumber = 42;
```

We have a variable called myNumber, which is a “label” of sorts for the “value” of 42.

**Note:** I’ll be using the weird term “label” here to avoid potentially-confusing language overloads. It’s not normal, so I wouldn’t recommend using it outside of this explanation.

Given that variable, we can use myNumber anywhere that we would use 42, and our program will have the same logic.

```js
const myNumber = 42;

// This expression
myNumber + 5;

// Is the same as this expression
42 + 5
```

Naturally, you might wonder why it’s beneficial to have variables at all if we can just replace them with their values. Great question.

The main reason for variables is that we often don’t know the value at write-time. We want a human-readable label for the value, but we won’t know what the actual value is until the program is run.

We could, for example, imagine that we want to welcome our users to the hottest new social media platform:

```js
const name = "Nathan";

console.log(`Welcome, ${name}`);
```

Unless we’re building an extremely niche website only for Nathans to meet other Nathans, we’ll need to make this more generic.

So, we’ll assume that we’ve prompted our user to provide their name. We can update our code to use a variable that is given its value at run-time.

```js
const welcomeUser = name => console.log(`Welcome, ${name}`);

const userName = getUserName(); // Perform magic
welcomeUser(userName);          // Pass the name to welcomeUser
```

When this code is run, getUserName will do its magic to get the user’s actual name, which we’ll assume they provided during sign-up, and assign that value to the userName variable.

**Note:** getUserName is fictional and not implemented. The above code is for illustrative purposes only and will not succeed if you try to run it as-is.

If the name is “Nathan,” userName is now a label for the value “Nathan.”

We can give that variable to welcomeUser because, as we already learned, we can replace any variable with its value and our program will do the same thing.

So, we could imagine that our code currently looks like this:

```js
const welcomeUser = name => console.log(`Welcome, ${name}`);

const userName = "Nathan";
welcomeUser(userName);          // Pass a name value to welcomeUser
```

Which is the same as:

```js
const welcomeUser = name => console.log(`Welcome, ${name}`);

welcomeUser("Nathan");          // Pass Nathan to welcomeUser
```

The welcomeUser function has now been given “Nathan” as the value for its name parameter, allowing it to output “Welcome, Nathan.”

This happens because the name label is replaced with its value of “Nathan.”

In summary, we passed “Nathan” into welcomeUser using the labels of userName and name. Neither of these knew what value they were going to hold when we wrote our original code. The values were determined when the program was run.

# Pass By Value

At this point, everybody should be on the same page. If you weren’t comfortable with passing variables/arguments around before, hopefully you’re up to speed because it’s time to start teasing apart the difference between passing by-reference and passing by-value.

We’ll begin with the style that is likely the more intuitive of the two: passing by-value.

In JavaScript, the primitive datatypes are passed by-value. If you’re assigning strings, booleans, or numbers – for example – to variables then you’re passing by-value.

Let’s look at an example of how passing by-value behaves.

Imagine that we have some numbers:

```js
let foo = 42;
let bar = 42;
```

We can see that foo and bar are labels for the same value of 42, so we decide to replace the second 42 with its label: foo.

```js
let foo = 42;
let bar = foo;
```

Based on the concepts from the previous section, we know that the logic of our code hasn’t changed.

Now, what would happen if we decided to start modifying the value for foo?

```js
let foo = 42;
let bar = foo;

foo += 8;

console.log(foo); // 50
console.log(bar);    // 42
```

As you can see, we changed the value of foo, but that did not affect the value of bar. This is because the 42 associated with foo was passed by-value to bar on line 2.

Though the value associated with foo was modified on line 4, that had no effect on the value associated with bar because bar doesn’t actually have anything to do with foo.

On line 2, you can think of bar receiving its own 42 to hold onto; it’s not sharing the 42 with foo.

Once again, this behaviour happens because numbers in JavaScript are passed by-value.

# Pass By Reference

As you might expect based on how I ended the previous section, passing by-reference allows multiple labels to share a value.

In JavaScript, Objects and Arrays are passed by-reference. We can see how this changes the behaviour by using Arrays instead of numbers.

```js
const foo = [42];
const bar = foo;

foo.push(50);

console.log(foo); // [42, 50]
console.log(bar); // [42, 50]
```

This time, instead of bar getting its own Array containing the value 42, it is given a reference to the Array. This means that the labels of foo and bar are sharing the exact same value.

The result is that any modifications made to either foo or bar will be reflected in the value for both. For example, adding or removing a value from bar will also add or remove that value from foo, and vice versa.

If we wanted the variables to be managed independently then we need to create two Arrays instead of just one, like so:

```js
const foo = [42];
const bar = [42];

foo.push(50);

console.log(foo); // [42, 50]
console.log(bar);    // [42]
```

Understanding how some values are passed by-reference can often allow you to write more optimized code and to avoid bugs.

A common way that passing by-reference can create bugs is by passing an Array (or Object) into a function, thinking that the Array has been passed in by-value.

```js
const people = ['The Dude', 'Donny', 'Walter'];

const lebowskify = names => {
  // Look at each value in names
  for (i in names) {
    // Replace any instance of The Dude with Lebowski
    if (names[i] === 'The Dude') {
      names[i] = 'Lebowski';
    }
  }
  return names;
};

const result = lebowskify(people);

console.log(result); // [ 'Lebowski', 'Donny', 'Walter' ]
console.log(people); // [ 'Lebowski', 'Donny', 'Walter' ]
```

Given that lebowskify returns a value, it’s very likely that the input Array was not intentionally modified. In other words, this is probably a bug. When you understand that Arrays and Objects are passed by-reference, you can see why and how this bug was introduced – presumably helping you to avoid it in the future.

That’s it. Just a short post today. Happy coding 😃
