let User = require("../models/User");
let Event = require("../models/Event");

module.exports.getUserData = async function(req, res) {
  let identification = req.body.identification;
  if (!identification) return res.status(404).json({ err: "user_not_found" });
  await User.findOne({ identification: identification })
    .populate("events")
    .exec(function(err, user) {
      if (err) {
        console.log("Error");
        return false;
      }
      return res.json(user);
    });
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
  /*let result = await User.aggregate([
    { $match: { id: "5c9588fee64d561bd8426e85" } },
    { $lookup: { from: "event", localField: "user", foreignField: "id", as: "user"  } },
    { $unwind: "$user" },
    { $replaceRoot: { newRoot: "$user" } }
  ]);*/
  /*
  await Event.find({ user: '5c9588fee64d561bd8426e85' })
    .populate("user")
    .exec(function(err, user) {
      if (err) {
        console.log("Error");
        return res.json(err);
      }
      return res.json(user);
    });
    */
    /*Event.find({user: '5c9588fee64d561bd8426e85'}, function(err, users) {
      if (err) {
        return res.send(err);
      } else {
        res.json(users);
      }
    });*/

  User.
  find().
  populate({
    path: 'events',
    select: 'event',
    options: { limit: 5 }
  }).
  exec(function(err, user) {
    if (err)
      return res.json(err)
    return res.json(user);
  });

};

module.exports.putUserData = function(req, res) {
  let eventName = req.body.eventName;
  let eventData = JSON.parse(req.body.eventData);
  let context = JSON.parse(req.body.context);
  let userData = JSON.parse(req.body.userData);
  var referer = req.body.aio_referer || "Direct";
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  console.log(eventData);
  console.log(userData);
  var userDataArray = Object.entries(userData);
  var eventDataArray = Object.entries(eventData); // [ ['a', 1], ['1', 'b'], ['2', 'c'] ]
  var contextArray = Object.entries(context); // [ ['a', 1], ['1', 'b'], ['2', 'c'] ]

  let identification = req.body.aioanalytics_id;
  let device_id = req.body.aio_device_id;
  let session_id = req.body.aioanalytics_sid;

  User.findOne({ identification: identification }, function(err, user) {
    if (!user) {
      user = new User({
        identification: identification,
        initial_referer: referer,
        initial_page: context.currentUrl
      });

      user.custom_data = {};
      user.custom_data.registration_date = new Date();
    } else {
      // If user found
      user.custom_data.last_modified = new Date();
    }

    // Setting important data
    user.ip = ip;
    user.device_id = device_id;
    user.session_id = session_id;

    // Setting user data
    if (userDataArray)
      userDataArray.map(data => {
        console.log("Adding custom data");
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
        console.log(currentPropertyValue);

        if (currentPropertyValue !== undefined)
          // If already existing user property
          eventDataArray.push([
            "#" + name,
            currentPropertyValue + " → " + value
          ]);
        // If new user property
        else eventDataArray.push(["#" + name, value]);

        // If changed in event, event saves changes
        if (currentPropertyValue !== undefined)
          eventDataArray.push([
            "#" + name,
            currentPropertyValue + " → " + value
          ]);
        else eventDataArray.push(["#" + name, value]);

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

        console.log(user.custom_data);
        user.markModified("custom_data");
      });

    // Setting event data
    let event = new Event({
      name: eventName,
      user: user._id,
      data: {}
    });
    if (eventDataArray)
      eventDataArray.map(data => {
        console.log("Adding custom data");
        var name = data[0];
        var value = data[1];
        event.data[name] = value;
      });
    if (contextArray)
      contextArray.map(data => {
        console.log("Adding custom data");
        var name = data[0];
        var value = data[1];
        event.data["_" + name] = value;
      });
    event
      .save()
      .then(event => {
        console.log("Event added successfully");
      })
      .catch(err => {
        console.log("Error on adding event " + err);
      });
    user.events.push(event.id);

    // Saving data
    user
      .save()
      .then(user => {
        res.json(JSON.stringify(user));
      })
      .catch(err => {
        res.status(400).send("unable to update the database " + err);
      });
  });
};
