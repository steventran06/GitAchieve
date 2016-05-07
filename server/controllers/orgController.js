const request = require('request');
const db = require('../db/database.js').db;
const pgp = require('../db/database.js').pgp;
const PORT = require('../config/config-settings').PORT;
const HOST = require('../config/config-settings').HOST;
const CALLBACKHOST = require('../config/config-settings').CALLBACKHOST;


// /api/v1/users/:id/orgs
exports.retrieveOrgs = (req, res) => {
  const queryId = req.params.id;
  const username = req.body.username;
  const dbTimestamp = pgp.as.date(new Date());
  console.log('----------------- HELLO ----------------------');
  console.log('queryId', queryId);
  console.log('username', username);
  // helper functions
  const addOrgsToDb = (orgs, callback) => {
    db.tx(task => {
      const queries = orgs.map(org => {
        return task.any('INSERT INTO $1~ AS $2~ ($3~, $4~, $5~, $6~) ' +
          'VALUES ($7, $8, $9, $10) ' +
          'ON CONFLICT ($3~) ' +
          'DO UPDATE SET ($4~, $5~, $6~) = ($8, $9, $10) ' +
          'WHERE $2~.$3~ = $7',
          ['orgs', 'o', 'id', 'orgname', 'followers', 'following',
          id, orgname, followers, following]);
      });
    return task.batch(queries);
    })
    .then(data => {
      console.log('Successfully added orgs!');
      callback();
    })
    .catch(error => {
      console.log('Did not successfully add orgs');
      console.error(error);
    })
  }

  // add a join for each org to our user_orgs table, associating each org with a user
  var addJoinsToDb = (orgs, callback) => {
    db.tx(task => {
      var queries = orgs.map(org => {
        return task.any('INSERT INTO $1~ ($2~, $3~, $4~) ' +
        'SELECT $5, $6, $7 WHERE NOT EXISTS ' +
        '(SELECT * FROM $1~ WHERE $3~ = $6~ AND $4~ = $7)',
        ['users_orgs', 'created_ga', 'user_id', 'org_id',
        dbTimestamp, queryId, org.id]);
      });
      return task.batch(queries);
    })
    .then(data => {
      console.log('Successfully added users_orgs joins');
      callback();
    })
    .catch(error => {
      console.log('Add users_orgs join error');
      console.error(error);
    });
  }

  // send the response for the api endpoint, containing all this user's orgs
  var patchReposResponse = () => {
    db.any(('SELECT o.id, o.created_ga, o.created_at, o.orgname, o.followers, o.following, o.score ' +
      'FROM users_orgs uo ' +
      'INNER JOIN orgs o ' +
      'ON o.id = uo.org_id ' +
      'WHERE uo.user_id=$1'), [queryId])
    .then(data => res.send(data))
    .catch(error => {
      console.error(error);
      res.status(500).send('Error querying orgs table');
    })
  }

  // get user info from GitHub
  var getOrgsFromGitHub = (username, callback) => {
    var options = {
      url: 'https://api.github.com/user/orgs',
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': username
      }
    };
    request(options, (error, response, body) => {
      if (error) {
        console.error(error);
      } else {
        callback(body);
      }
    });
  };

  // gather the helper functions together into one asynchronous series
  const handleGitHubData = data => {
    var orgs = JSON.parse(data);
    addOrgsToDb(orgs, addJoinsToDb.bind(null, orgs, patchOrgsResponse))
  }

  // call helper functions
  // getOrgsFromGitHub(username, handleGitHubData);
}



// '/:orgname'
exports.retrieveOne = function(req, res) {
  var query = {_id: req.params.id};
  // TODO: fill this out with Postgres findOne query
};

// '/:orgname/stats'
exports.retrieveStats = function(req, res) {
  var query = {_id: req.params.id};
  // TODO: fill this out with Postgres findOne query
};

exports.addStats = function(req, res) {
  var query = {_id: req.params.id};
  // TODO: fill this out with Postgres findOne query
};

// '/:orgname/achievements'
exports.retrieveAchievements = function(req, res) {
  var query = {_id: req.params.id};
  // TODO: fill this out with Postgres findOne query
};

exports.addAchievements = function(req, res) {
  var query = {_id: req.params.id};
  // TODO: fill this out with Postgres findOne query
};
