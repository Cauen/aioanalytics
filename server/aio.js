var Aio = Aio || {};
Aio.generateUniqueID = function() {
  return (
    Math.random().toString(36).substr(2, 8) + '-' + 
    Math.random().toString(36).substr(2, 8) + '-' + 
    Math.random().toString(36).substr(2, 8) + '-' + 
    Math.random().toString(36).substr(2, 8)
  );
};
Aio.setCookie = function(name, value) {
  document.cookie = name + "=" + value + ";";
};
Aio.getCookie = function(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2)
    return parts
      .pop()
      .split(";")
      .shift();
};
Aio.documentReady = function(f) {
  /in/.test(document.readyState)
    ? setTimeout(function() {
        Aio.documentReady(f);
      }, 9)
    : f();
};
Aio.isIdentified = function() {
  console.log('Testing if Is identified');
  var aioCookieId = Aio.getCookie("aioanalytics_id");
  var aioLocalStorageId = localStorage.getItem("aioanalytics_id");
  var both = aioCookieId && aioLocalStorageId;
  return both;
};
Aio.unidentify = function() {
  Aio.setCookie("aio_device_id", "");
  Aio.setCookie("aioanalytics_sid", "");
  Aio.setCookie("aioanalytics_id", "");

  localStorage.removeItem("aio_device_id");
  localStorage.removeItem("aioanalytics_sid");
  localStorage.removeItem("aioanalytics_id");

  sessionStorage.removeItem("aioanalytics_sid");
};
Aio.reidentify = function(userID) {
  Aio.unidentify();
  Aio.identify(userID);
};
Aio.identify = function(userID, eventName, eventData = {}, userData = {}) {
  console.log('Identifying as ' + userID || ' Random');
  // Working with device id
  if (!Aio.getCookie("aio_device_id")) {
    var device_id_generated = Aio.generateUniqueID();
    Aio.setCookie("aio_device_id", device_id_generated);
    try {
      localStorage.setItem("aio_device_id", device_id_generated);
    } catch (e) {
      console.warn("Browser does not allow storing in local storage");
    }
    console.log('Setting random device ID: ' + device_id_generated);
  }
  var device_id = Aio.getCookie("aio_device_id");

  // Working with session id
  if (!sessionStorage.getItem("aioanalytics_sid")) {
    var session_id = Aio.generateUniqueID();
    sessionStorage.setItem("aioanalytics_sid", session_id);
    Aio.setCookie("aioanalytics_sid", session_id);
    try {
      localStorage.setItem("aioanalytics_sid", session_id);
    } catch (e) {
      console.warn("Browser does not allow storing in local storage");
    }
    console.log('Setting random Session ID ' + session_id);
  }

  // Working with identification id
  if (userID) {
    console.log('Setting a new identification to ' + userID);
    //If already identified and changing, track event
    var currentIdentification = localStorage.getItem("aioanalytics_id") || '';

    Aio.setCookie("aioanalytics_id", userID);
    Aio.aioanalyticsSet = true;
    try {
      localStorage.setItem("aioanalytics_id", userID);
    } catch (e) {
      console.warn("Browser does not allow storing in local storage");
    }

    Aio.identifyRequest(currentIdentification, eventName, eventData, userData);
  } else {
    if (!localStorage.getItem('aioanalytics_id')) {
      console.log('Setting default identification to same as Device ID ' + device_id_generated);
      // Default identification is device_id
      Aio.setCookie("aioanalytics_id", device_id);
      try {
        localStorage.setItem("aioanalytics_id", device_id);
      } catch (e) {
        console.warn("Browser does not allow storing in local storage");
      }
    } else {
      console.log('Identification already set and not random set');
    }
    Aio.identifyRequest('', eventName, eventData, userData);
  }
};
Aio.log = function(e) {
  console.log(e);
};

//Helpers
Aio.serialize = function(obj) {
  if ("string" == typeof obj) {
    return obj;
  }
  return Object.keys(obj)
    .map(function(key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
    })
    .join("&");
};
Aio.parseTextToJSON = function(maybeJSON) {
  var response;
  try {
    response = JSON.parse(maybeJSON);
  } catch (error) {
    response = maybeJSON;
  }
  return response;
};
Aio.whatBrowser = function() {
  if (
    (navigator.userAgent.indexOf("Opera") ||
      navigator.userAgent.indexOf("OPR")) != -1
  ) {
    return "Opera";
  } else if (navigator.userAgent.indexOf("Chrome") != -1) {
    return "Chrome";
  } else if (navigator.userAgent.indexOf("Safari") != -1) {
    return "Safari";
  } else if (navigator.userAgent.indexOf("Firefox") != -1) {
    return "Firefox";
  } else if (
    navigator.userAgent.indexOf("MSIE") != -1 ||
    !!document.documentMode == true
  ) {
    //IF IE > 10
    return "IE";
  } else {
    return "unknown";
  }
};
Aio.userContext = function() {
  var unknown = "-";

  // screen
  var screenWidth = "";
  var screenHeight = "";
  if (screen.width) {
    width = screen.width ? screen.width : "";
    height = screen.height ? screen.height : "";
    screenWidth = width;
    screenHeight = height;
  }

  // browser
  var nVer = navigator.appVersion;
  var nAgt = navigator.userAgent;
  var browser = navigator.appName;
  var version = "" + parseFloat(navigator.appVersion);
  var majorVersion = parseInt(navigator.appVersion, 10);
  var nameOffset, verOffset, ix;

  // Opera
  if ((verOffset = nAgt.indexOf("Opera")) != -1) {
    browser = "Opera";
    version = nAgt.substring(verOffset + 6);
    if ((verOffset = nAgt.indexOf("Version")) != -1) {
      version = nAgt.substring(verOffset + 8);
    }
  }
  // Opera Next
  if ((verOffset = nAgt.indexOf("OPR")) != -1) {
    browser = "Opera";
    version = nAgt.substring(verOffset + 4);
  }
  // Edge
  else if ((verOffset = nAgt.indexOf("Edge")) != -1) {
    browser = "Microsoft Edge";
    version = nAgt.substring(verOffset + 5);
  }
  // MSIE
  else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
    browser = "Microsoft Internet Explorer";
    version = nAgt.substring(verOffset + 5);
  }
  // Chrome
  else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
    browser = "Chrome";
    version = nAgt.substring(verOffset + 7);
  }
  // Safari
  else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
    browser = "Safari";
    version = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf("Version")) != -1) {
      version = nAgt.substring(verOffset + 8);
    }
  }
  // Firefox
  else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
    browser = "Firefox";
    version = nAgt.substring(verOffset + 8);
  }
  // MSIE 11+
  else if (nAgt.indexOf("Trident/") != -1) {
    browser = "Microsoft Internet Explorer";
    version = nAgt.substring(nAgt.indexOf("rv:") + 3);
  }
  // Other browsers
  else if (
    (nameOffset = nAgt.lastIndexOf(" ") + 1) <
    (verOffset = nAgt.lastIndexOf("/"))
  ) {
    browser = nAgt.substring(nameOffset, verOffset);
    version = nAgt.substring(verOffset + 1);
    if (browser.toLowerCase() == browser.toUpperCase()) {
      browser = navigator.appName;
    }
  }
  // trim the version string
  if ((ix = version.indexOf(";")) != -1) version = version.substring(0, ix);
  if ((ix = version.indexOf(" ")) != -1) version = version.substring(0, ix);
  if ((ix = version.indexOf(")")) != -1) version = version.substring(0, ix);

  majorVersion = parseInt("" + version, 10);
  if (isNaN(majorVersion)) {
    version = "" + parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion, 10);
  }

  // mobile version
  var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

  // cookie
  var cookieEnabled = navigator.cookieEnabled ? true : false;

  if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled) {
    document.cookie = "testcookie";
    cookieEnabled = document.cookie.indexOf("testcookie") != -1 ? true : false;
  }

  // system
  var os = unknown;
  var clientStrings = [
    { s: "Windows 10", r: /(Windows 10.0|Windows NT 10.0)/ },
    { s: "Windows 8.1", r: /(Windows 8.1|Windows NT 6.3)/ },
    { s: "Windows 8", r: /(Windows 8|Windows NT 6.2)/ },
    { s: "Windows 7", r: /(Windows 7|Windows NT 6.1)/ },
    { s: "Windows Vista", r: /Windows NT 6.0/ },
    { s: "Windows Server 2003", r: /Windows NT 5.2/ },
    { s: "Windows XP", r: /(Windows NT 5.1|Windows XP)/ },
    { s: "Windows 2000", r: /(Windows NT 5.0|Windows 2000)/ },
    { s: "Windows ME", r: /(Win 9x 4.90|Windows ME)/ },
    { s: "Windows 98", r: /(Windows 98|Win98)/ },
    { s: "Windows 95", r: /(Windows 95|Win95|Windows_95)/ },
    { s: "Windows NT 4.0", r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
    { s: "Windows CE", r: /Windows CE/ },
    { s: "Windows 3.11", r: /Win16/ },
    { s: "Android", r: /Android/ },
    { s: "Open BSD", r: /OpenBSD/ },
    { s: "Sun OS", r: /SunOS/ },
    { s: "Linux", r: /(Linux|X11)/ },
    { s: "iOS", r: /(iPhone|iPad|iPod)/ },
    { s: "Mac OS X", r: /Mac OS X/ },
    { s: "Mac OS", r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
    { s: "QNX", r: /QNX/ },
    { s: "UNIX", r: /UNIX/ },
    { s: "BeOS", r: /BeOS/ },
    { s: "OS/2", r: /OS\/2/ },
    {
      s: "Search Bot",
      r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
    }
  ];
  for (var id in clientStrings) {
    var cs = clientStrings[id];
    if (cs.r.test(nAgt)) {
      os = cs.s;
      break;
    }
  }

  var osVersion = unknown;

  if (/Windows/.test(os)) {
    osVersion = /Windows (.*)/.exec(os)[1];
    os = "Windows";
  }

  switch (os) {
    case "Mac OS X":
      osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
      break;

    case "Android":
      osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
      break;

    case "iOS":
      osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
      osVersion = osVersion[1] + "." + osVersion[2] + "." + (osVersion[3] | 0);
      break;
  }

  // flash (you'll need to include swfobject)
  /* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
  var flashVersion = "no check";
  if (typeof swfobject != "undefined") {
    var fv = swfobject.getFlashPlayerVersion();
    if (fv.major > 0) {
      flashVersion = fv.major + "." + fv.minor + " r" + fv.release;
    } else {
      flashVersion = unknown;
    }
  }

  return {
    screen_width: screenWidth,
    screen_height: screenHeight,
    browser: browser,
    browser_version: version,
    browser_major_version: majorVersion,
    mobile: mobile,
    os: os,
    os_version: osVersion,
    cookies: cookieEnabled,
    flash_version: flashVersion,
    current_url: window.location.href,
    current_id: localStorage.getItem("aioanalytics_id"),
    current_device_id: localStorage.getItem("aio_device_id"),
    current_sid: localStorage.getItem("aioanalytics_sid"),
    referrer: document.referrer
  };
};

//Make Request
Aio.makingRequest = false;
Aio.requestArray = [];
Aio.init = function (id) {
  Aio.projectId = id;
}
Aio.makeCORSRequest = function (method, url, data, callbackSuccess, callbackError) {
  if (!Aio.projectId)
    return console.warn('Needs project ID');
  if (Aio.makingRequest) {
    Aio.requestArray.push({method, url, data, callbackSuccess, callbackError});
    console.log(Aio.requestArray);
    return console.warn('You cant make 2 request at same time');
  }

  Aio.makingRequest = true;
  data.context = Aio.userContext();
  data.project = Aio.projectId;
  var base64data = btoa(JSON.stringify(data));
  data = {};
  data.data = base64data

  console.log('Data sent');
  console.log(JSON.parse(atob(data.data)));

  var request = new XMLHttpRequest();
  request.open(method, url, true);
  request.onreadystatechange = function() {
    if (request.readyState==4) {
      if (request.status === 200) {  
        callbackSuccess(request.responseText);
        Aio.makingRequest = false; 
        if (Aio.requestArray.length) {
          var nextRequest = Aio.requestArray.pop();
          Aio.makeCORSRequest(nextRequest.method, nextRequest.url, nextRequest.data, nextRequest.callbackSuccess, nextRequest.callbackError); 
        }
      } else {  
        callbackError(request.responseText);
        Aio.makingRequest = false;  
      }  
    }
    
  };
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  var query = Aio.serialize(data);
  if (method.toUpperCase() === "GET") {
    url = url + "?" + query;
    var query = "";
  }
  request.send(query);
};
Aio.siteURL = "http://192.168.1.6:3000";
Aio.identifyRequest = function(currentIdentification, eventName, eventData = {}, userData = {}) {
  if (localStorage.getItem("aioanalytics_id") == currentIdentification && !eventName)
      return console.warn('Already identified');

  
  Aio.makeCORSRequest(
    "POST",
    Aio.siteURL + "/user/identify",
    {
      old_identification: currentIdentification,
      event_name: eventName,
      event_data: eventData,
      user_data: userData,
    },
    function(data) {
      console.log("Identified to " + data);
    },
    function(data) {
      console.log("Not identified " + data);
    }
  );
};
Aio.increment = function(userProperties, eventName, eventData = {}, userData = {}) {
  Aio.makeCORSRequest(
    "POST",
    Aio.siteURL + "/user/increment",
    {
      user_properties: userProperties,
      event_name: eventName,
      event_data: eventData,
      user_data: userData,
    },
    function(data) {
      console.log("Identified");
    },
    function(data) {
      console.log("Not identified");
    }
  );
}
Aio.track = function(event_name, event_data = {}, user_data = {}) {
  if (!Aio.isIdentified())
    Aio.identify();

  if (typeof event_name !== "string") event_name = "pageview";
  if (typeof event_data !== "object") event_data = {};
  if (typeof user_data !== "object") user_data = {};

  Aio.makeCORSRequest(
    "POST",
    Aio.siteURL + "/user/track",
    {
      event_name: event_name || "pageview",
      event_data: event_data,
      user_data: user_data
    },
    function(data) {
      console.log("ok ");
    },
    function(data) {
      console.log("Error");
    }
  );
};

Aio.autoTrack = false;
if (Aio.autoTrack) {
  Aio.pageViewDate = new Date();
  Aio.documentReady(function() {
    console.log("Ready");  
    Aio.track("_pageload", {timeToLoad: (new Date() - Aio.pageViewDate)/1000 });
  });
  Aio.track("_pageview");
}