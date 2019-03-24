let User = require("../models/User");
let Event = require("../models/Event");

var ObjectID = require("mongodb").ObjectID;

module.exports.anonIdentified = async function(req, res) {
  let user_current_identification =
    req.body.current_identification || req.body.aio_device_id;
  let identification = req.body.aioanalytics_id;
  let userData = JSON.parse(req.body.userData) || {};
  //console.log(userData);

  if (identification !== user_current_identification) {
    passEvents(user_current_identification, identification, req, res, userData);
    return res.send("Events changed");
  }
  return res.send("Events not changed");
};

function passEvents(oldUserId, newUserId, req, res, userData) {
  var context = JSON.parse(req.body.context);
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  User.findOne({ identification: oldUserId }, function(err, user) {
    if (!user) return log("Old user not found");

    User.findOne({ identification: newUserId }, function(err, newUser) {
      // If identifying with a new identification, but there is no event
      if (!newUser) {
        console.log(context);
        user.identification = newUserId;
        user
          .save()
          .then(event => {
            // After update user, save event identify
            trackEvent(
              "_Anon Identified",
              { old_user: oldUserId, new_user: newUserId },
              userData,
              context,
              ip,
              newUserId,
              req.body.context.aio_device_id,
              req.body.aioanalytics_sid,
              req.body.aio_referrer
            );
          })
          .catch(err => {
            log("unable update event the database " + err);
          });
        return log(
          "New user not found, changing current identification to " + newUserId
        );
      }

      // If newUserId already exist, track a reIdentification
      trackEvent(
        "_Reidentified",
        { old_user: oldUserId, new_user: newUserId },
        userData,
        context,
        ip,
        newUserId,
        req.body.context.aio_device_id,
        req.body.aioanalytics_sid,
        req.body.aio_referrer
      );

      // Transfer events
      // Needs to transfer data, like purchases value too
      Event.find(
        {
          user: user.id
        },
        function(err, events) {
          if (!events) return log("Event not found");

          events.map(event => {
            log(event);
            event.user = newUser.id;
            event.data["_imported"] = oldUserId;

            // If event changed user number, increment in new user
            var userEventDataArray = Object.entries(event.data);
            userEventDataArray.map(event => {
              console.log(event);
              var name = event[0];
              var value = event[1].value;

              if (value && value[0] && (value[0] === "+" || value[0] === "-"))
                newUser.custom_data[name] += value.substring(1);
            });
            newUser.markModified("custom_data");
            newUser
              .save()
              .then(user => {
                console.log("User saved after events passing");
              })
              .catch(err => {
                log(
                  "unable update user in events loop, to the database " + err
                );
              });

            event.comments.push({
              content: "imported from " + oldUserId + " to " + newUserId
            });
            event.markModified("data");
            event.markModified("comments");
            event
              .save()
              .then(event => {
                log(JSON.stringify(event));
              })
              .catch(err => {
                log("unable update event the database " + err);
              });
          });
        }
      );

      // Inativate old
      user.transfered_to = newUserId;
      user
        .save()
        .then(user => {
          log("User inactivated");
        })
        .catch(err => {
          log("Error at user inactivation");
        });
    });
  });
}

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

function trackEvent(
  eventName,
  eventData,
  userData,
  context,
  ip,
  identification,
  device_id,
  session_id,
  referrer
) {
  console.log(context);
  var userDataArray = Object.entries(userData);
  var eventDataArray = Object.entries(eventData); // [ ['a', 1], ['1', 'b'], ['2', 'c'] ]
  var contextArray = Object.entries(context); //    [ ['a', 1], ['1', 'b'], ['2', 'c'] ]
  eventDataArray.map(data => {
    // Transform event data value in object
    data[1] = { value: data[1] };
  });

  if (!identification) res.send("User not identified");

  User.findOne(
    {
      identification: identification
    },
    function(err, user) {
      if (!user) {
        user = new User({
          identification: identification,
          initial_referrer: referrer,
          initial_page: context.currentUrl
        });

        user.custom_data = {};
        user.custom_data.registration_date = new Date();
      } else {
        // If user found
        user.custom_data.last_modified = new Date();
        user.updated = new Date();
      }

      // Setting important data
      user.ip = ip;
      user.device_id = device_id;
      user.session_id = session_id;

      // Setting user data
      if (userDataArray)
        userDataArray.map(data => {
          log("Adding custom data");
          var name = data[0];
          var value = data[1];

          // Old and new
          var isChangingDefaultVariable = name[0] === "$";
          var incrementingDecrementing = value[0] === "+" || value[0] === "-"; // Aio.track('Bought', {button: '162', value: 125}, {"$revenue": +125})
          var numericNewValue = getNumberifNumeric(value);
          var numericOldValue = isChangingDefaultVariable
            ? getNumberifNumeric(user[name.substring(1)])
            : getNumberifNumeric(user[name]);

          // If user property changed in event, event saves changes
          var currentPropertyValue;
          if (isChangingDefaultVariable)
            currentPropertyValue = user[name.substring(1)];
          else currentPropertyValue = user.custom_data[name];
          log(currentPropertyValue);

          // If changed in event, event saves changes
          if (currentPropertyValue !== undefined)
            // If already existing user property
            eventDataArray.push([
              "#" + name,
              {
                value,
                extra: {
                  changed_user:
                    "Changed " + currentPropertyValue + " → " + value
                }
              }
            ]);
          // If new user property
          else eventDataArray.push(["#" + name, { value, extra: {} }]);

          // If incrementing a numeric field
          if (numericNewValue && numericOldValue && incrementingDecrementing) {
            if (isChangingDefaultVariable)
              user[name.substring(1)] += numericNewValue;
            else user.custom_data[name] += numericNewValue;
          } // If is a user default Field
          else if (isChangingDefaultVariable)
            // Default field
            user[name.substring(1)] = value;
          // Custom field
          else user.custom_data[name] = value;

          log(user.custom_data);
          user.markModified("custom_data");
        });

      // Setting event data, and change user based on context
      let event = new Event({
        name: eventName,
        user: user._id,
        data: {}
      });
      if (eventDataArray)
        eventDataArray.map(data => {
          log("Adding custom data");
          var name = data[0];
          var value = data[1];
          event.data[name] = value;
        });
      if (contextArray)
        contextArray.map(data => {
          log("Adding custom data");
          var name = data[0];
          var value = data[1];

          var changedUser = false;
          if (user.custom_data["_" + name] !== value)
            changedUser =
              "Changed: " + user.custom_data["_" + name] + " → " + value;
          user.custom_data["_" + name] = value;
          event.data["_" + name] = {
            value: value,
            extra: { changed_user: changedUser }
          };
          user.markModified("custom_data");
        });
      event
        .save()
        .then(event => {
          log("Event added successfully");
        })
        .catch(err => {
          log("Error on adding event " + err);
        });

      // Saving data
      user
        .save()
        .then(user => {
          log("Tracked");
        })
        .catch(err => {
          log("Unable to track in the database " + err);
        });
    }
  );
}

module.exports.trackEvent = function(req, res) {
  let eventName = req.body.eventName;
  let eventData = JSON.parse(req.body.eventData);
  let context = JSON.parse(req.body.context);
  let userData = JSON.parse(req.body.userData);
  var referrer = req.body.aio_referrer || "Direct";
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  let identification = req.body.aioanalytics_id;
  let device_id = req.body.aio_device_id;
  let session_id = req.body.aioanalytics_sid;

  trackEvent(
    eventName,
    eventData,
    userData,
    context,
    ip,
    identification,
    device_id,
    session_id,
    referrer
  );

  res.send("1");
};

function log(val) {}
