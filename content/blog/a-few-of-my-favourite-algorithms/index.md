# A Few of My Favourite Algorithms

**August 23rd, 2020**

---

There comes a time in every nerd’s life when he realizes that he is, in fact, even nerdier than he thought.

For me, this realization came when I heard myself unironically say: “Well, my favourite algorithm is this linear majority voting algorithm.”

It was on that fateful day when I realized that my life had taken a turn. I was that guy who has a favourite algorithm…

And so, I present to you, a few of this nerd’s favourite algorithms 🤓

**Caveat:** These are off the top of my head and are prone to recency bias. I’m not saying that these are the world’s greatest algorithms.

# Boyer-Moore Voting Algorithm

This one is my reigning favourite due to its simplicity. It’s basically a little math problem that a grade schooler could easily understand, bottled up into a slick, tasty, little nugget of linear time complexity.

The Problem: [On Leetcode](https://leetcode.com/problems/majority-element/)

Find the majority element in an array, where the majority element fills more than half of the array (instances > array.length / 2).

Here is an example implementation:

```python
def majorityElement(nums: List[int]) -> int:
        # Voting algorithm - O(n) time
        majority = None
        count = 0
        
        for num in nums:
            # If count has reached zero, the majority is unknown.
            # Current element becomes the majority.
            if count == 0:
                majority = num

            # Current majority votes for itself
            if majority == num:
                count += 1
            # All other values vote against current majority
            else:
                count -= 1
            
        return majority
```

In addition to using linear time, this algorithm also uses constant space. My initial solution involved storing a dictionary with a count of every element (linear space), so this implementation was a clear improvement.

The Boyer-Moore algorithm obviously solves a very specific problem, but it does it so well that I can’t help but appreciate it.

# Tree Traversal

Okay, so this one is arguably not a specific algorithm. In a way, it’s the opposite of the previous one. Instead of being used to solve a very specific problem, it can be used in a wide variety of domains.

A great thing about tree traversal is that it can be completely decoupled from the application logic. For example, the [traverse function from Babel](https://babeljs.io/docs/en/babel-traverse) allows you to write simple functions that modify the AST without ever worrying about how the AST is structured.

I’ll illustrate a few basic tree traversals here.

## Binary Tree

Given the typical Leetcode `TreeNode`:

```python
# Definition for a binary tree node.
class TreeNode:
  def __init__(self, val=0, left=None, right=None):
    self.val = val
    self.left = left
    self.right = right
```

We can perform some basic traversals, which accept a visit function as an argument. You could imagine visit to be the implementation of business logic for that node.

```python
def traverse(root: TreeNode, visit):
    # Base case
    if not root:
        return root
        
    # In-order Traversal
    traverse(root.left, visit)
    visit(root)
    traverse(root.right, visit)
        
    return root
```

```python
def traverse(root: TreeNode, visit):
    # Base case
    if not root:
        return root
        
    # Pre-order Traversal
    visit(root)
    traverse(root.left, visit)
    traverse(root.right, visit)
        
    return root
```

```python
def traverse(root: TreeNode, visit):
    # Base case
    if not root:
        return root
        
    # Post-order Traversal
    traverse(root.left, visit)
    traverse(root.right, visit)
    visit(root)
        
    return root
```

Oh yeah… Did I mentioned how much I love [recursion](/recursion)?

I adore the fact that you can completely change the order in which the entire tree is explored just by changing the order in which you visit the nodes. Recursion takes care of the heavy lifting.

## N-Ary Trees

Admittedly, I like this Breadth-First algorithm a lot less than the Depth-First ones above, but the processing queue is a useful pattern that I first learned from problems such as n-ary tree traversal, so I need to pay my respktz.

Assuming that the child nodes live in an iterable, stored at a children attribute:

```python
def traverse(root, visit):
  if not root:
    return root

  queue = [root]

  while queue:
    # Dequeue node to process
    node = queue.pop(0)

    # Enqueue next node(s) for processing
    for child in node.children:
      queue.append(child)
        
      # Perform business logic on this node
      visit(node)
      
  return root
```

There isn’t much else to say about this algorithm. It benefits from using a non-recursive implementation (memory performance) while still being very readable.

For these reasons, as well as the processing queue pattern, I would still consider it – while perhaps not a “favourite” per-say – a very important algorithm to keep in my brain.

# Detect Linked List Cycle

This is another algorithm that I love for its simplicity. While it’s great on its own, it is very specific. So, I’m picking it out here as a representative of a larger pattern that I reach for quite often: two pointers.

The Problem: [On Leetcode](https://leetcode.com/problems/linked-list-cycle/)

Given a singly-linked list defined as:

```python
class ListNode:
  def __init__(self, x):
    self.val = x
    self.next = None
```

We can detect a cycle like so:

```python
def hasCycle(head: ListNode) -> bool:
  slow = fast = head

  while slow and fast:
    if fast.next is None:
      # Reached end with no cycles
      return False
    else:
      slow = slow.next
      fast = fast.next.next

      # Pointing to the same instance (cycle occurred)
      if slow is fast:
        return True
```

This uses the runner pattern, where we have a “slow” pointer and a “fast” pointer. If there’s a cycle, the fast pointer will never hit the “end” because there is no end.

In the case of no end, the fast pointer will continue to cycle around until it hits the slow pointer, at which point we’ve detected a cycle!

Easy peasy. 🍋

# That’s it for Today

You’ve probably noticed that these are all very simple algorithms. The most “complex” piece is probably the recursive logic within the tree traversals.

I know that some people love “clever” or “concise” code. When it comes to algorithms, my personal preference is simplicity, readability, and expressiveness. If the algorithm leverages a common and/or useful pattern in a unique or powerful way, all the better.

But cleverness is not a virtue that I extol in my favourite algorithms, at least not right now.

👋 Bye
