import {clone} from './lib/common.js';
import {Tree, Node, Empty} from './lib/tree.js';

/* DEV LOG
  I implemented this on Feb 24 2021
  from the Wikipedia article on heaps
  https://en.wikipedia.org/wiki/Heap_(data_structure)
*/

// constants
  const DEFAULT_OPTIONS = {
    asTree: true,           /* underlying implementation as tree, false is list implementation */
    max: true,              /* max heap, false is min heap */
    arity: 2,               /* binary, then 3 is ternary, etc. */
    compare: undefined      /* a custom comparator per JS Array.sort compareFunction interface */
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters 
      // with comparison directed by the heap property
      // so compare(bigger, smaller) is > 0 for max heap
      // while compare(smaller, bigger) is > 0 for min heap
      // and vice versa
      // in essence, it's 
      // compare(top, bottom) > 0 and compare(bottom, top) < 0
      // DEFAULT comparison is simply this applied to Numbers
  };

  const OptionKeys = new Set(Object.keys(DEFAULT_OPTIONS));

  // helper constants


export default class Heap {
  // private fields
  #size
  #store
  #firstEmptySpace

  // API
    constructor(options, ...data) {
      if ( ! options ) {
        options = DEFAULT_OPTIONS;
      }
      options = Object.assign(clone(DEFAULT_OPTIONS), options);

      guardValidOptions(options);

      this.config = Object.freeze(clone(options));

      if ( options.max ) {
        this.findMax = () => this.peek();
        this.extractMax = () => this.pop();
        this.deleteMax = () => void this.pop();
      } else {
        this.findMin = () => this.peek();
        this.extractMin = () => this.pop();
        this.deleteMin = () => void this.pop();
      }

      if ( options.asTree ) {
        this.#store = new Tree({arity: options.arity});
        this.#firstEmptySpace = this.#store.firstEmptyLeaf();
      } else {
        this.#store = new Array();
        this.#firstEmptySpace = 0;
        this.#store[this.#firstEmptySpace] = Empty;
      }

      if ( data.length ) {
        console.warn(`Need to implement Floyd algorithm for heapifying data`);
      }

      this.#size = 0;
    }

    get size() {
      return this.#size;
    }

    peek() {
      // show top of heap
      if ( this.config.asTree ) {
        return this.#store.getRoot().thing;
      } else {
        return this.#store[0];
      }
    }

    pop() {
      // remove top of heap and show it
      let root, top;
      if ( this.config.asTree ) {
        root = this.#store.getRoot();
        top = root.thing;
      } else {
        root = 0;
        top = this.#store[root];
      }

      this.#deleteThing(root);

      this.#size -= 1;

      return top;
    }

    push(thing) {
      // push thing onto top of heap

      let aRoot = this.#firstEmptySpace;

      // insert the item and update the firstEmptySpace for next time
      if ( this.config.asTree ) {
        aRoot.thing = thing;
        this.#firstEmptySpace = this.#store.firstEmptyLeaf();
      } else {
        this.#store[aRoot] = thing;
        this.#firstEmptySpace = this.#store.length;
        this.#store[this.#firstEmptySpace] = Empty;
      }

      this.#siftUp(aRoot);

      this.#size += 1;
    }

    replace(thing) {
      // remove top of heap and push thing there
      const top = this.peek();
      
      let aRoot;

      if ( this.config.asTree ) {
        aRoot = this.#store.getRoot();
      } else {
        aRoot = 0;
      }

      this.#updateThing(aRoot, thing);

      return top;
    }

  // private instance methods
    // 
    #updateThing(aRoot, newThing) {
      // change the value of thing
      let currentThing;

      // get current and update aRoot's thing
        if ( this.config.asTree ) {
          currentThing = aRoot.thing;
          aRoot.thing = newThing;
        } else {
          currentThing = this.#store[aRoot];
          this.#store[aRoot] = newThing;
        }

      const comparison = this.#compare(newThing, currentThing);

      if ( comparison > 0 ) {
        this.#siftUp(aRoot);
      } else if ( comparison < 0 ) {
        this.#siftDown(aRoot);
      }
    }

    #deleteThing(aRoot) {
      // delete the element
      // sift down
      if ( this.config.asTree ) {
        aRoot.thing = Empty;
      } else {
        this.#store[aRoot] = Empty;
      }
      this.#siftDown(aRoot);
    }

    #siftUp(aRoot) {
      let parent = this.#getParent(aRoot);

      // as long as parent exists and is lower in the heap than aRoot
      while(
            parent !== undefined && 
            this.#compare(this.#getThing(parent), this.#getThing(aRoot)) < 0 
        ) {
          // swap them and push aRoot up, 
          // and get the new aRoot slot for the next comparison
          ([aRoot] = this.#swap(aRoot, parent));  

          // what just happened?
          // aRoot has now become the slot that parent was

          // get the next parent for the next comparison
          parent = this.#getParent(aRoot);
      }
    }

    #siftDown(aRoot) {
      let children = this.#getChildren(aRoot);
      let topChild = this.#getTopFromList(children);

      // as long as topChild exists and aRoot is lower in the heap than topChild
      
      while(
          topChild !== undefined &&
          this.#compare(this.#getThing(aRoot), this.#getThing(topChild)) < 0
        ) {
          // push it down, and get the new aRoot for comparison
          ([aRoot] = this.#swap(aRoot, topChild));  
          // what just happened?
          // aRoot has now become the slot that topChild was

          // get the next topChild for comparison
          children = this.#getChildren(aRoot);
          topChild = this.#getTopFromList(children);
      }
    }

    #getThing(slot) {
      if ( this.config.asTree ) {
        return slot.thing;
      } else {
        if ( slot < this.#store.length ) {
          // Note on getThing logic for list implementations:
            // if we have a custom comparator,
            // it needs to handle undefined things (and provide an ordering logic for those)
            // so we pass them through, even if they are undefined
            // if we do not have a custom comparator
            // we pass the value if it is not undefined
            // otherwise if it is undefined we pass Empty
          const value = this.#store[slot];
          if ( this.config.compare ) {
            return value; 
          } else if ( value !== undefined ) {
            return value;
          } else {
            return Empty;
          }
        } else {
          return Empty;
        }
      }
    }

    #swap(a, b) {
      // what do we swap?
        // we only "swap" the *value* (thing) of two slots, 
        // NOT the *structure* of two slots (thing + the children)
      if ( this.config.asTree ) {
        const temp = a.thing;
        a.thing = b.thing;
        b.thing = temp;
      } else {
        const temp = this.#store[a];
        this.#store[a] = this.#store[b];
        this.#store[b] = temp;
      }

      // why do we return the slots in reversed order?
        // because this represents the new positions of the 
        // slots values
      return [b, a];
    }

    #compare(aThing, bThing) {
      if ( this.config.compare ) {
        return this.config.compare(aThing, bThing);
      } else {
        // Empty is always lower in heap 
        // regardless of min or max
        if ( bThing == Empty ) {
          return 1;
        } else if ( aThing == Empty ) {
          return -1;
        }

        // heap-property comparison
        if ( aThing > bThing ) {
          return this.config.max ? 1 : -1;
        } else if ( aThing == bThing ) {
          return 0;
        } else {
          return !this.config.max ? 1 : -1;
        }
      }
    }

    #getParent(aRoot) {
      if ( this.config.asTree ) {
        return aRoot.parent;
      } else {
        if ( aRoot > 0 ) {
          return Math.floor((aRoot-1)/this.config.arity);
        }
      }
    }

    #getChildren(aRoot) {
      if ( this.config.asTree ) {
        // children are nodes
        return [...aRoot.children];
      } else {
        // children are indices
        const {arity} = this.config;
        const start = arity*aRoot+1;
        const list = [];
        for( let i = start; i < start+arity; i++ ){
          list.push(i);
        }
        return list;
      }
    }

    #getTopFromList(list) {
      let top;
      let topThing = Empty;

      if ( this.config.asTree ) {
        // top is a node, 
        // list is nodes
        for ( const el of list ) {
          const {thing} = el;
          if ( this.#compare(thing, topThing) >= 0 ) {
            top = el;
            topThing = thing;
          }
        }
        return top;
      } else {
        // top is an index
        // list of indices
        list.forEach(index => {
          const thing = this.#store[index];
          if ( this.#compare(thing, topThing) >= 0 ) {
            top = index;
            topThing = thing;
          }
        });
      }

      return top;
    }

  // static methods
    static print(heap) {
      let row = 0;

      if ( heap.config.asTree ) {
        for( const stuff of heap.#store.bfs() ) {
          const {node,depth} = stuff;
          if ( depth > row ) {
            row = depth;
            console.log('\n');
          }
          if ( typeof node.thing !== 'symbol' ) {
            process.stdout.write(`node: ${node.thing} \t`);
          } else {
            process.stdout.write(`node: ${Symbol.keyFor(node.thing)} \t`);
          }
        }
      } else {
        for( let i = 0; i < heap.#store.length; i++ ) {
          const depth = Math.floor(Math.log(i+1)/Math.log(heap.config.arity));
          //console.log({depth,i, arity:heap.config.arity});
          const thing = heap.#store[i];
          if ( depth > row ) {
            row = depth;
            console.log('\n');
          }
          if ( typeof thing !== 'symbol' ) {
            process.stdout.write(`node: ${thing} \t`);
          } else {
            process.stdout.write(`node: ${Symbol.keyFor(thing)} \t`);
          }
        }
      }
      console.log('\n\n');
    }

    static merge(heap1, heap2) {
      console.log({heap1,heap2});
    }
}

export const Class = Heap;
export function create(...args) {
  return new Heap(...args);
}

// helper classes
// helper methods
  function guardValidOptions(opts) {
    const OptionTypes = {
      asTree: 'boolean',         
      max: 'boolean',              
      arity: 'number',              
      compare: ['undefined', 'function']
    };

    const errors = [];
    const typesValid = Object
      .entries(opts)
      .every(([key, value]) => {
        const type = OptionTypes[key]
        let valid;
        if ( Array.isArray(type) ) {
          valid = type.includes(typeof value);
        } else {
          valid = typeof value === type;
        }
        if ( ! valid ) {
          errors.push({
            key, value, 
            message: `
              Option ${key} must be a ${type} if given. 
              It was ${value}.
            `
          });
        }
        return valid;
      });

    const keysValid = Object
      .keys(opts)
      .every(key => {
        const valid = OptionKeys.has(key);
        if ( ! valid ) {
          errors.push({
            key,
            message: `
              Options contained an unrecognized key: ${key}
            `
          });
        }
        return valid;
      });

    const isValid = typesValid && keysValid;

    if ( ! isValid ) {
      console.warn(JSON.stringify({errors,keysValid, typesValid}, null, 2));
      throw new TypeError(`Options were invalid.`);
    }
  }

