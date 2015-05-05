var childProcess = require('child_process');
var spawn = childProcess.spawn;
var exec = childProcess.exec;
var once = require('once');
var isWindows = process.platform === 'win32';

module.exports = function(pid, signal, cb) {
  if (isWindows) {
    exec('taskkill /pid ' + pid + ' /T /F');
  } else {
    var tree = {};
    tree[pid] = [];
    var pidsToProcess = {};
    pidsToProcess[pid] = 1;

    buildProcessTree(pid, tree, pidsToProcess, function() {
      killAll(tree, signal);
      try {
        killAll(tree, signal);
      }
      catch (err) {
        if (cb) {
          return cb(err);
        } else {
          throw err;
        }
      }
      if (cb) {
        return cb();
      }
    });
  }
};

function killAll(tree, signal) {
  var killed = {};
  Object.keys(tree).forEach(function(pid) {
    tree[pid].forEach(function(pidpid) {
      if (!killed[pidpid]) {
        killPid(pidpid, signal);
        killed[pidpid] = 1;
      }
    });
    if (!killed[pid]) {
      killPid(pid, signal);
      killed[pid] = 1;
    }
  });
}

function killPid(pid, signal) {
  try {
    process.kill(pid, signal);
  }
  catch (err) {
    if (err.code !== 'ESRCH') {
      throw err;
    }
  }
}

function buildProcessTree(parentPid, tree, pidsToProcess, cb) {
  var ps = spawn('ps', ['-o', 'pid', '--no-headers', '--ppid', parentPid]);
  var allData = '';
  ps.stdout.on('data', function(data) {
    data = data.toString('ascii');
    allData += data;
  });

  var onStdoutClose = once(function() {
    delete pidsToProcess[parentPid];

    if (allData === '') {
      // no more parent processes
      if (Object.keys(pidsToProcess).length === 0) {
        cb();
      }
      return;
    }

    var pids = [];
    var pid = '';
    for (var i = 0; i < allData.length; i++) {
      if (allData[i] === '\n') {
        pids.push(parseInt(pid, 10));
        pid = '';
        continue;
      }
      if (allData[i] !== ' ') {
        pid += allData[i];
      }
    }

    pids.forEach(function(pid) {
      tree[parentPid].push(pid);
      tree[pid] = [];
      pidsToProcess[pid] = 1;
      buildProcessTree(pid, tree, pidsToProcess, cb);
    });
  });

  ps.stdout.on('close', onStdoutClose);
}