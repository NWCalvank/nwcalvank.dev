<style>
  .markdown-body h1 {
    border-bottom: none;
  }

  @media (prefers-color-scheme: dark) {
    h1, h2, p, li {
      color: #fff;
    }

    .markdown-body {
      color-scheme: dark;
    }
</style>

# JavaScript's async Functions are Overrated

**September 13th, 2020**

---

Ever since the `async/await` syntax was introduced to the ECMAScript spec, I've had my reservations about it. I think it is a useful abstraction for a couple of very specific problems, but it is otherwise overrated.

Today, I'd like to share with you the places where I actually use async functions and why I don't use them more often.

Please note, this is not a deep dive on Promises. If you're looking for a more complete explanation of Promises and JavaScript's async model, you could check out this presentation that I gave to my coworkers in 2019 about async JS.

<iframe width="1280" height="720" src="https://www.youtube.com/embed/Wd1QTl74qJE" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Of course, async functions are just using Promises & Generators under the hood, which I explain in the video that I linked above, but there are benefits to dot-chaining syntax that are lost in the `async/await` abstraction.

By using `async/await` together with raw Promise chains, we can get the benefits of retaining a shared lexical environment (via `async/await`) alongside the ergonomics of Promise chains. 🔥

# The Two Cases Where I Use Async Functions

These days, I'm writing a lot of React apps with a Django backend. I have never really used JavaScript serverside unless you count some personal projects where I checked out Express to see what all the fuss was about, so there is certainly a chance that I'm missing the perfect `async/await` use-case that exists serverside.

With that caveat, here are the two situations where I've used `async/await` enough for me to consider it a "pattern."

## Avoiding Child Scopes

There is one thing that I truly believe `async/await` does very very well; it keeps values on the same level of lexical scope.

This is very handy when you're dealing with a number of values that are being gathered asynchronously that you'd rather not thread through your Promise chain. Here's a comparison to illustrate my point.

A Promise chain creates a child scope inside of each successive callback:

```js
// Arbitrary async function that returns a Promise
const asyncInc = value => Promise.resolve(value + 1);

const asyncAdding = x => {
  asyncInc(x)
    .then(y => {
      // We have to thread y through here
      return Promise.all([y, asyncInc(y)]);
    })
    .then(([y, z]) => {
      console.log('We collected:', x, y, z);
    });
};

asyncAdding(2); // Prints 'We collected: 2 3 4'
```

There are ways around this with the Reader Monad, which I'll let [Brian Lonsdorf explain](https://vimeo.com/user7981506), but I can't honestly tell you that I have a good argument for introducing that into the code snippet above to solve this problem. I also don't really understand it.

Now, with an async function, we can avoid entering the lexical scope of the callback function, leaving `x`, `y`, and `z` at the top-level of the function scope. This avoids the variable access problem entirely.

```js
// Arbitrary async function that returns a Promise
const asyncInc = value => Promise.resolve(value + 1);

const asyncAdding = async x => {
  const y = await asyncInc(x);
  const z = await asyncInc(y);
  console.log('We collected:', x, y, z);
};

asyncAdding(2); // Prints 'We collected: 2 3 4'
```

This version is clearly preferable from a readability perspective. It looks like your run-of-the-mill synchronous code.

Keep in mind that this example is just to illustrate how `async/await` solves the lexical scope problem. We haven't yet introduced error handling, which is where Promise chains will be the preferred syntax.

## This First, Please

This use case is relatively common when I'm manually managing React state in older portions of our app (pre-Hooks).

When dealing with component-level state, we often need to do a bunch of stuff and then trigger an explicit state change after everything was done. Let's imagine it's something like this:

```js
const classMethod = async () => {
    await makeApiRequests();
    await makeMoreApiRequests();

    // Once those have all resolved
    this.setState({ loading: false });
}
```

__Note:__ Before the parallelization police come after me, we're going to assume for this example that `makeApiRequests` has to resolve _before_ `makeMoreApiRequests` can begin doing its thing.

My point with this example is that tossing in the `await` to say that "this needs to happen before that" can be pretty handy since there's almost no syntax involved.

The sequential `await` lines for async processes seem to match most developers' intuition as well, which is helpful when you're working with less experienced team members. It looks like synchronous code, and they can (for the most part) think about it in that way.

This mental model obviously breaks down if you think of it as blocking all activity in your application, but that isn't a problem that any Promise can solve. It's a problem with how that developer thinks about asynchronous JavaScript programming.

I would like to note that it's very easy to use a Promise chain here instead. It requires some extra syntax, but it's not a big deal. Depending on the libraries that you're using, there may even be a sequential Promise runner function baked in that would just accept these functions, similar to a compose.

If the loading state always needed to be changed here, I would actually lean toward a Promise chain instead. As we'll see soon, error handling with Promise chains is more ergonomic than without.

```js
const classMethod = async () => {
    makeApiRequests()
        // I like to use _ to explicitly indicate that I'm not using the returned value
        .then(_ => {
            makeMoreApiRequests();
        })
        // Once those have all resolved/rejected...
        .finally(_ => {
            this.setState({ loading: false });
        })
}
```

Now that we've looked at the two cases I've found for using `async/await`, let's explore how we can use them together.

# Signalling Intention

Writing code that signals your intention is a big deal to me. Any time that I can look at some code and immediately rule out a bunch of things that it's _not_ doing while also having a reasonable guess of what the writer intends for it to do, I'm stoked.

In my eyes, we can use/not use `async/await` to signal our intentions in a way similar to using/not using `map`.

When comparing `map` and `forEach`, we can think of `map` as being able to do anything that `forEach` can do, but not the other way around. `map` is also associated with an agreed-upon usage, which aides in clarity. Though we _can_ mutate state inside of a `map` in JavaScript, we really shouldn't.

In other words, using `forEach` tells the reader that we aren't creating a return value from the iteration and that we might be mutating state, whereas `map` tells them that we need the return value and are not mutating state. If you find yourself not using the return value, you should switch to `forEach`.

We can do a similar thing with `.then()` and `await`. If we are using `await`, it's very explicit whether or not we're using the return value. By default, then, I can assume that the function inside of a `.then()` is probably using the return value.

If it isn't using the value then I'll either swap it out for an `await` or (more likely) wrap it in another function, with an explicit underscore to indicate that the value is being ignored.

> Any time that you can rule out potential misinterpretations of your code, you're doing yourself and your fellow developers a favour.

This is one way of using `async/await` and Promise chains together.

Here is an illustration of the concept:

```js
const foo = async () => {
    await doThing();

    // This doesn't need the result of doThing
    return doNextThing();
};
```

In the example above, it's obvious that `doNextThing` does not accept a return value from `doThing`. That's not obvious with a Promise chain.

With that said, I think that this is a bit silly:

```js
const foo = async () => {
    const res = await doThing();

    // This needs the result of doThing
    return doNextThing(res);
};
```

When dot-chaining serves this purpose perfectly...

```js
const foo = () => doThing().then(doNextThing);
```

The difference becomes all the more obvious as more steps are added.

Finally, if you're not using the value in a dot-chaining syntax, you can wrap the function in a function with an explicit underscore to further signal your intentions:

```js
const foo = () => doThing().then(_ => { return doNextThing(); });
```

# Promise Chains vs try/catch Syntax

As I alluded to earlier, I believe that Promise chains are more ergonomic with respect to error handling and, by extension, overall control flow.

This is probably just a personal preference, so you may disagree with me here, but I don't find JavaScript's `try/catch` syntax to be preferable over Promise chains. It even reintroduces lexical scoping issues.

For example, if I have something like this:

```js
const foo = async () => {
    const res = await apiRequest();

    console.log(res);
};
```

And I need to add error handling to it, I could do this with `try/catch`:

```js
const foo = async () => {
    let res;

    try {
        res = await apiRequest();
    } catch (e) {
        console.error(e);
    }

    if (res) {
        console.log(res);
    }
};
```

Or I could do this with a Promise chain:

```js
const foo = async () => {
    const res = await apiRequest().catch(console.error);

    if (res) {
        console.log(res);
    }
};
```

Not only does the Promise chain avoid the nested scoping issue, it is also (in my opinion) a more intuitive way of catching Promises. You can't accidentally miss a `.then()` in a Promise chain, but you can easily miss an `await` inside of an async `try` block.

Likewise, you can miss wrapping a function call in a `try/catch`, but it's a bit harder to miss an explicit Promise chain that doesn't end with a `.catch()`. This is, again, just my opinion -- but it seems to be the case in the codebases that I've worked in.

> In my eyes, the way that JavaScript's overall syntax is structured, dot-chaining is preferable to code blocks when dealing with sequential actions (think [map](/map)/[filter](/filter)/[reduce](/reduce)).

The situation only gets worse if you have multiple steps that need to be handled in _different_ ways.

```js
const foo = async () => {
    let res1;
    let res2;

    try {
        res1 = await apiRequest();
    } catch (e) {
        console.error(e);
    }

    try {
        res2 = await apiRequest();
    } catch (e) {
        console.log('Oh no');
    }

    if (res1 && res2) {
        console.log(res1, res2);
    }
};
```

Or, with a Promise chain...

```js
const foo = async () => {
    const res1 = await apiRequest().catch(console.error);
    const res2 = await apiRequest().catch(_ => { console.log('Oh no'); });

    if (res1 && res2) {
        console.log(res1, res2);
    }
};
```

Here, we've used `await` to retain our lexical environment for sequential jobs while using the ergonomics of dot-chaining to cleanly manage our error handling.

Of course, `apiRequest` could have any number of jobs/catches inside of it, all abstracted away behind the Promise that it returns. Regardless of the syntax that you use (`async/await` or Promise chains), the composition that you get from Promises is the bee's knees.

On that, I think we can all agree.

# Composition

Anyone who knows me had to know that this was coming.

This example is inspired by something that I did at work recently. Our code isn't open source, so I can't post it here, but I'll explain the basic idea.

My hope is that it will help tie a bunch of the things I've discussed here into a single example that somewhat resembles a real situation.

We were consuming a collection-management API endpoint from our React app. When a form was saved, this endpoint would receive a POST for every new record, a PATCH for every updated record, and a DELETE for every deleted record.

Something like:

```js
// I've aded these here to allow you to run the code with handleSave() if you want to
const showToast = console.log;
const redirect = async () => {
  console.log('Redirecting...');
};

const addRecord = async id => {
  showToast('Record added.');
  return id;
};
const updateRecord = async id => {
  showToast('Record updated.');
  return id;
};
const deleteRecord = async id => {
  showToast('Record deleted.');
  return id;
};

// 'Real' code begins
const handleSave = async () => {
  const toAdd = [1, 2, 3];
  const toUpdate = [4, 5, 6];
  const toDelete = [7, 8, 9];

  return (
    // Make all requests
    Promise.all([
      addRecords(toAdd),
      updateRecords(toUpdate),
      deleteRecords(toDelete),
    ])
      // Only redirect if all requests were successful
      .then(_ => redirect())
  );
};

const addRecords = ids => Promise.all(ids.map(addRecord));
const updateRecords = ids => Promise.all(ids.map(updateRecord));
const deleteRecords = ids => Promise.all(ids.map(deleteRecord));
```

The logic here was fine, but the problem was that every API request would automatically dispatch an action that showed a toast message. The result was 9 toast messages for the example above.

For those watching at home, that's too many toasts!

Instead, we wanted to still show helpful toasts, but not repetitive ones. We wanted to show one for adds (all successful or any failure), one for updates (all successful or any failure), and one for each delete.

Instead of saying that each request was successful or unsuccessful, I needed to aggregate all of the adds and all of the updates. Each collection would be responsible for letting the caller know whether they were all successful or if something went wrong.

The resulting code was something like this:

```js
const showToast = console.log;
const redirect = async () => {
  console.log('Redirecting...');
};

// Try returning a Promise.reject(id) here to see the error handling
const addRecord = async id => id;
const updateRecord = async id => id;
const deleteRecord = async id => {
  showToast('Record deleted.');
  return id;
};

// 'Real' code begins
const handleSave = () => {
  const toAdd = [1, 2, 3];
  const toUpdate = [4, 5, 6];
  const toDelete = [7, 8, 9];

  return (
    // Make all requests
    Promise.all([
      addRecords(toAdd),
      updateRecords(toUpdate),
      deleteRecords(toDelete),
    ])
      // Only redirect if all requests were successful
      .then(_ => redirect())
      // Show toast for first error raised, if any
      .catch(({message}) => showToast(message)
  );
};

const addRecords = ids =>
  Promise.all(ids.map(addRecord))
    // defines its own all-successful behaviour
    .then(() => {
      if (ids.length > 0) {
        showToast(ids.length > 1 ? 'Records created.' : 'Record created.');
      }
    })
    // defines its own custom error to be caught by the caller
    .catch(() => {
      throw Error('Unable to create new Record(s).');
    });

const updateRecords = ids =>
  Promise.all(ids.map(updateRecord))
    .then(() => {
      if (ids.length > 0) {
        showToast(ids.length > 1 ? 'Records updated.' : 'Record updated.');
      }
    })
    .catch(() => {
      throw Error('Unable to update new Record(s).');
    });

const deleteRecords = ids => Promise.all(ids.map(deleteRecord));
```

This is all just one big Promise composition, and it makes me very happy.

Yes, the Promise chain syntax is a bit noisy. In this situation, we can switch to `async/await` without having to bother with scoping issues from the `try/catch`, so it's not so bad, but I'm not sure that I'd objectively say it's better or worse than the raw Promise chains.

```js
const showToast = console.log;
const redirect = async () => {
  console.log('Redirecting...');
};

const addRecord = async id => id;
const updateRecord = async id => id;
const deleteRecord = async id => {
  showToast('Record deleted.');
  return id;
};

// 'Real' code begins
const handleSave = () => {
  const toAdd = [1, 2, 3];
  const toUpdate = [4, 5, 6];
  const toDelete = [7, 8, 9];

  return (
    // Make all requests
    Promise.all([
      addRecords(toAdd),
      updateRecords(toUpdate),
      deleteRecords(toDelete),
    ])
      // Only redirect if all requests were successful
      .then(_ => redirect())
      // Show toast for first error raised, if any
      .catch(({message}) => showToast(message))
  );
};

const addRecords = async ids => {
  try {
    // Don't forget the await here!
    await Promise.all(ids.map(addRecord));

    // defines its own all-successful behaviour
    if (ids.length > 0) {
      showToast(ids.length > 1 ? 'Records created.' : 'Record created.');
    }

  } catch {
    // defines its own custom error to be caught by the caller
    throw Error('Unable to create new Record(s).');
  }
};

const updateRecords = async ids => {
  try {
    await Promise.all(ids.map(updateRecord));

    if (ids.length > 0) {
      showToast(ids.length > 1 ? 'Records updated.' : 'Record updated.');
    }

  } catch {
    throw Error('Unable to update new Record(s).');
  }
};

const deleteRecords = ids => Promise.all(ids.map(deleteRecord));
```

I really think dot-chaining works out better for us on-average, but your mileage may vary.

Fortunately, the logic underpinning this is very simple, regardless of your preferred syntax.

We have an array of Promises being created by mapping over the ids that we create/update/delete. Each of those arrays of Promises gets composed into a single Promise with `Promise.all()` inside of `addRecords`, `updateRecords`, and `deleteRecords` respectively.

Those Promises are then put into a new array of Promises inside of `handleSave`, where they are composed again into a single Promise via `Promise.all()`.

The beautiful thing about this is that each Promise can define its own success and failure behaviour without any of that complexity bubbling up to the Promise that wraps it. Notice, for example, that the add and update `.catch()` methods rethrow a custom error, which is then caught by the `.catch()` inside of `handleSave`.

All that `handleSave` needs to know is how to handle an error and how to take any subsequent actions. Because this will produce another Promise, `handleSave` could easily be used in yet another Promise chain, with even higher-level concerns.

This control flow could be tough to manage without the appropriate use of Promises and async functions. Hopefully it's been clear that I'm not arguing against them completely.

I just think that they're over-hyped and should only be used where appropriate, leaving the control flow largely to dot-chaining.

Thanks for reading! Have yourself a great day 🤓
