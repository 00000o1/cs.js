/**
    Below is the solution I implemented after reading their solution.  

    The reason I did this (even tho I have another, better, linear time solution)

    is because I didn't really understand their recursive solution and wanted to 

    understand it.
    
    Even tho I think it's messy to handle so many cases like this and initially didn't

    like it, after implementing it and trying to understand it I came to appreciate it is

    to some extent elegant, because of the "simplicity" of the recursion.

    I also do not really understand why this makes it an expoential O(2**n) algorithm.


    Analysing a globstar only path I get a tree that branches n-children wide at each level

    (one for each turn of the globastar loop over input)

    And has a depth of k/2 levels (k being the length of a contiguous globstar sequence,

    in the pattern, and each downl-level subtracts 2 from the length of the pattern)

    That gives n**O(k) 

    My guess about its exponential complexity analysis (if that is indeed correct, and I have

    seen other claims that regex matching on globstars can be exponential, even if I've never

    really understood it clearly), is that at each call of the top block in the recursive function

    we have a choice of going two ways: globastar way, or linear match (any or exact) way. That gives

    a tree with 2 options and at most n levels (since in the any or exact match branch we subtract 1 from

    input each time). This seems like it might give a O(2**n) runtime. But I'm not sure as I don't

    really see it so clearly yet I think.

    In practice I feel the globstar path tree with O(n**k) is going to eclipse any O(2**n) runtime 

    in many cases. Just an instinct. But I'd like to look a bit more at some exponential analysis of

    this just so I understand it.

    I think it's important for me to be able to understand if an algorithm that's not trivial is going

    to have an exponential runtime!!!
**/
let regxMatch = function match(str, pattern) {
  // array from allows us to handle unicode
  // as str[index] and substr and slice don't handle unicode
  // but for .. of and Array.from (str[Symbol.iterator]) DO 
  // correctly isolate single logical Unicode characters
  return matchR(Array.from(str), Array.from(pattern)); 
}

function matchR(str, pattern) {
  // conclusions based on length in the base case
    if ( str.length === 0 && pattern.length === 0 ) {
      return true;
    }
    if( str.length === 0 && pattern.length > 0 ) {
      // remaining pattern after string
      // entire pattern is unmatches so
      return false;
    }
    if ( str.length > 0 && pattern.length === 0 ) {
      // remaining string after pattern
      // entire string is unmatched (and we don't implement
      // but instead assume ^ and $) so
      return false;
    }
  
  // matching based on content
    const [patternHead, ...patternTail] = pattern;
    const [strHead, ...strTail] = str;

    // the pattern in the below is consume 1 or more characters
    // of str and or pattern and recurse down

    // glob match
    if ( patternTail.length && patternTail[0] === '*' ) {
      const newPatternTail = patternTail.slice(1);

      for(let i = 0; i < str.length; i++) {
        const newStrTail = str.slice(i);
        const strTailHead = newStrTail[0];

        // zero or more pattern[0]*
        if ( matchR(newStrTail, newPatternTail) ) {
          return true;
        }

        // if that didn't match 
        // check if 1 or more pattern[0]* matches
        if ( patternHead === strTailHead ) {
          continue;
        } else if ( patternHead === '.' ) {
          continue;
        } else {
          return false;
        }
      }
      console.warn(`We are here?`);
    // any match
    } else if ( patternHead === '.' ) {
      return matchR(strTail, patternTail);
    // exact match
    } else if ( patternHead === strHead ) {
      return matchR(strTail, patternTail);
    // no match
    } else {
      return false;
    }
}

const str = process.argv[2] || 'fabbbc';
const pattern = process.argv[3] || '.ab*c';
console.log(str, pattern, regxMatch(str, pattern));


/**
  The below solution will use the Thompson NFA construction 
  which I learned many years ago and is how I naturally, instinctively 
  and always think about regex, and was probably one reason I 
  did not really get, nor get the motivation for, the above recursive
  method, at least at first, even tho I came to want to understand it also
  so as not to have some gap in my knowledge that could be something I'm asked
  about (*shock face*), "Please design a recursive exponential time algorithm
  for regular expression matching and do it's complexity analysis." .. hint if you read this
  please don't ask me that. Hahaha
**/

regxMatch = function match(str, pattern) {
  // build NFA from pattern
  // step through str, keeping match frontier up to date
  // if there's any frontier left we have a match
}
