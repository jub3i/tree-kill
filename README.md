#Tree Kill

Kill all processes in the process tree, including the root process.

This repo is a fork of [https://github.com/pkrumins/node-tree-kill](https://github.com/pkrumins/node-tree-kill)

Significant changes include:
- Included callback support, since this is an function with async internals [https://github.com/pkrumins/node-tree-kill/pull/5](https://github.com/pkrumins/node-tree-kill/pull/5)
- Patched a race condition [https://github.com/pkrumins/node-tree-kill/issues/7](https://github.com/pkrumins/node-tree-kill/issues/7)
- Formatted source code to my personal preference, see included .jscsrc and .jshintrc

##Example

In these examples we kill all the child processes of the process with pid `1`, including the process with pid `1` itself.

```js
var kill = require('@jub3i/tree-kill');

//NOTE: function call below has async internal components and may only finish
//killing processes after the call is made
kill(1, 'SIGKILL');
```

```js
var kill = require('@jub3i/tree-kill');
kill(1, 'SIGKILL', function(err) {
  if (err) {
    console.log('there was an error:', err);
    return;
  }
  console.log('all processes killed');
});
```

#Methods

##require('@jub3i/tree-kill')(pid, signal, cb);

Sends signal `signal` to all children processes of the process with pid `pid`, including `pid`. When the killing is complete `cb` is called.

**Note:** For Linux, this uses `ps -o pid --no-headers --ppid PID` to find the parent pids of `PID`.

**Note:** For Windows, this uses `'taskkill /pid PID /T /F'` to kill the process tree.

##require('@jub3i/tree-kill')(pid, signal);

Sends signal `signal` to all children processes of the process with pid `pid`, including `pid`.

##require('@jub3i/tree-kill')(pid, cb);

Sends signal `signal` to all children processes of the process with pid `pid`, including `pid`. Signal defaults to `SIGTERM`. When the killing is complete `cb` is called.

##require('@jub3i/tree-kill')(pid);

Sends signal `SIGTERM` to all children processes of the process with pid `pid`, including `pid`.

#Install

With [npm](https://npmjs.org) do:

```
npm install @jub3i/tree-kill
```

**Note:** Install requires an up to date version of npm which supports scoped packages, otherwise npm will install a git repo into the dependencies field of your package.json

License
=======

MIT
