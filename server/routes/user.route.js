let User = require("../models/User");
let Event = require("../models/Event");

var ObjectID = require("mongodb").ObjectID;

function setUserData(user, name, value) {
  user[name] = value;
  user.updated = new Date();
  return value;
}

function getUserData(user, name) {
  return user[name];
}

function setUserCustomData(user, name, value) {
  user.custom_data[name] = value;
  user.updated = new Date();
  user.markModified("custom_data");
  return user;
}

function getUserCustomData(user, name) {
  return user.custom_data[name];
}

module.exports.increment = async function(req, res, next) {
  let data = fromBase64ToObject(req.body.data);
  let eventData = data.event_data || {};
  let eventName = data.event_name || "";
  let userData = data.user_data || {};
  let context = data.context;
  let userProperties = data.user_properties;

  let userPropertiesArray = Object.entries(userProperties);
  User.findOne({ identification: context.current_id }, (err, user) => {
    if (!user) { // If user dont exist, set user with properties
      var newUserData = Object.assign(userData, userProperties);
      trackEvent(eventName || '_Increment', eventData, newUserData, context)
    } else {
      var userNewData = {};
      userPropertiesArray.map(userProperty => {
        var name = userProperty[0];
        var value = getNumberifNumeric(userProperty[1]);

        if (!value || !name) 
          return next(new Error('Value or name not correct'));

        var currentValue;
        if (name == '$revenue')
          currentValue = getUserData(user, 'revenue') || 0;
        else 
          currentValue = getUserCustomData(user, name) || 0;
      
        userNewData[name] = currentValue + value;
        
      });
      Object.assign(userData, userNewData);
      var newEventData = Object.assign(eventData, {_incrementing: true});
      trackEvent(eventName || '_Increment', newEventData, userData, context);
    }
  });
  
}

module.exports.anonIdentified = function(req, res) {

  let data = fromBase64ToObject(req.body.data);
  let eventData = data.event_data || {};
  let eventName = data.event_name || "";
  let userData = data.user_data || {};
  let context = data.context;

  let oldIdentification = data.old_identification || context.current_device_id;
  let newIdentification = context.current_id;
  if (!oldIdentification || !newIdentification)
    return log('Some data required');

  Object.assign(eventData, { old_user: oldIdentification, new_user: newIdentification });

  User.findOne({ identification: oldIdentification }, function(err, oldUser) {
    if (!oldUser) return;

    User.findOne({ identification: newIdentification }, function(err, newUser) {
      // Identified as new user
      if (!newUser) {
        log(context);
        oldUser.identification = newIdentification;
        oldUser.save().then(event => {
          trackEvent(
            eventName || "_Anon Identified",
            eventData,
            userData,
            context
          );
          res.send('_Anon Identified');
        }).catch(err => {
          console.log("unable update user identification the database " + err);
        });
      } else {
        log('_Reidentifing');
        // Identified as already existing user
        trackEvent(
          eventName || "_Reidentified",
          eventData,
          userData,
          context
        );

        // Transfer events
        // Needs to transfer data, like purchases value too
        Event.find({ user: oldUser.id }, function(err, events) {
          if (!events) return;

          events.map(event => {
            // Transfering
            event.user = newUser.id;
            event.data["_imported"] = oldIdentification;

            // Incrementing all events userData on user
            var userEventDataArray = Object.entries(event.data);
            userEventDataArray.map(event => {
              var name = event[0];
              var value = event[1].value;
              var options = event[1].options;
              if (options) {
                var increment = options.increment;
                if (increment) {
                  if (name == "#$revenue")
                    newUser.revenue += increment;
                  else
                    newUser.custom_data[name.substring(1)] += increment;
                  log('INCREMETING IN NEW USER ['+name+ ']' + increment);
                }
              }
            });

            event.comments.push({
              content: "imported from " + oldIdentification + " to " + newIdentification
            });
            
            event.markModified("data");
            event.markModified("comments");
            event.save().then(event => {log('Event saved');}).catch(err => {log("unable update event the database " + err);});
          });
          
          log('New user revenue' + newUser.revenue);
          newUser.markModified("custom_data");
          newUser.save().then(user => { }) .catch(err => {log("unable update user in events loop, to the database " + err);});
          
        });

      

        // Inativate old
        oldUser.transfered_to = newIdentification;
        oldUser.save().then(user => {log("User inactivated");}).catch(err => {log("Error at user inactivation");});
      }
    });
  });

  return res.send("Events changed changed");
};

module.exports.getAllUsers = function(req, res) {
  User.find(function(err, users) {
    if (err) {
      return res.send(err);
    } else {
      res.json(users);
    }
  });
};

function getNumberifNumeric(n) {
  if (!isNaN(parseFloat(n)) && isFinite(n)) return parseFloat(n);
  return 0;
}

module.exports.userWithEvents = async function(req, res) {
  let identification = req.body.identification;
  User.aggregate(
    [
      {
        $match: {
          identification: identification
        }
      },
      {
        $lookup: {
          from: "event",
          localField: "_id",
          foreignField: "user",
          as: "events"
        }
      },
      {
        $limit: 1
      }
    ],
    function(err, users) {
      if (err) {
        return res.send(err);
      } else {
        res.json(users[0]);
      }
    }
  );
};

module.exports.usersWithEvents = async function(req, res) {
  User.aggregate(
    [
      {
        $lookup: {
          from: "event",
          localField: "_id",
          foreignField: "user",
          as: "events"
        }
      }
    ],
    function(err, users) {
      if (err) {
        return res.send(err);
      } else {
        res.json(users);
      }
    }
  );
};

// {prop: 123, prop2: 1234} -> [['prop', {value: 123}], ['prop2', {value: 1234}]]
function toArrayData(object) {
  var array = Object.entries(object);
  array.map(property => {
    property[1] = { value: property[1], options: {} };
  });
  return array;
}

function trackEvent(eventName, eventData, userData, context) {
  var userDataArray = toArrayData(userData);
  var eventDataArray = toArrayData(eventData);
  var contextArray = toArrayData(context); 

  if (!context.current_id) res.send("User not identified");

  User.findOne({ identification: context.current_id }, function(err, user) {
    if (!user) {
      user = new User({
        identification: context.current_id,
        initial_referrer: context.referrer || 'Direct',
        initial_page: context.current_url,
      });

      user.custom_data = {};
      user.custom_data.registration_date = new Date();
    } else 
      user.updated = new Date();
    
    // Setting user data
    userDataArray.map(userProperty => {
      var name = userProperty[0];
      var value = userProperty[1].value;

      var userValue = name[0] === '$' ? user[name.substring(1)] : user.custom_data[name];

      // Tooltip event, if changed user data
      var eventData;
      if (userValue != value) {
        eventData = [ "#" + name,{ value: value, options: { } }];
        eventData[1].options.changed_user = "Changed " + userValue + " → " + value;
        eventData[1].options.old_value = userValue;
        eventData[1].options.new_value = value;
        if (userValue + value)
          eventData[1].options.increment = value - userValue;
      }
      else 
        eventData = ["#" + name, { value: value, options: {} }];
      eventDataArray.push(eventData);

      name[0] === '$' ?  user[name.substring(1)] = value : user.custom_data[name]  = value;
      user.markModified("custom_data");
    });

    // Setting event data, and change user based on context
    let event = new Event({name: eventName, user: user._id, data: {}});
    eventDataArray.map(data => {
      var name = data[0];
      var value = data[1].value;
      var options = data[1].options || {};
      event.data[name] = {value: value, options: options};
    });

    contextArray.map(data => {
      var name = data[0];
      var value = data[1].value;

      var changedMessage = "";
      if (user.custom_data["_" + name] !== value) 
        changedMessage = "Changed: " + user.custom_data["_" + name] + " → " + value;
      
      user.custom_data["_" + name] = value;
      user.markModified("custom_data");

      event.data["_" + name] = {
        value: value,
        options: { changed_user: changedMessage }
      };
    });

    event.save().then(event =>  {log("Event added successfully");}) .catch(err => {log("Error on adding event " + err);});
    user.save() .then(user =>   {log("Tracked");})                  .catch(err => {log("Unable to track in the database " + err);});

  });
}

function fromBase64ToObject(base64) {
  return JSON.parse(Buffer.from(base64, "base64").toString());
}

module.exports.trackEvent = function(req, res) {
  //var data = JSON.parse(atob(req.body.data));
  var data = fromBase64ToObject(req.body.data);

  let eventName = data.event_name;
  let eventData = data.event_data;
  let userData = data.user_data;
  let context = data.context;

  trackEvent(eventName, eventData, userData, context);

  res.send("1");
};


var log = console.log;
console.log = function() {
  ['log', 'warn', 'error'].forEach((methodName) => {
    const originalMethod = console[methodName];
    console[methodName] = (...args) => {
      let initiator = 'unknown place';
      try {
        throw new Error();
      } catch (e) {
        if (typeof e.stack === 'string') {
          let isFirst = true;
          for (const line of e.stack.split('\n')) {
            const matches = line.match(/^\s+at\s+(.*)/);
            if (matches) {
              if (!isFirst) { // first line - current function
                              // second line - caller (what we are looking for)
                initiator = matches[1];
                break;
              }
              isFirst = false;
            }
          }
        }
      }
      originalMethod.apply(console, [...args, '\n', `  at ${initiator}`]);
    };
  });
};
