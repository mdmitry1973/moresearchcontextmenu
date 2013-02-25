

self.port.on("SendSearchEngines", function(text) {
            console.log("self.port.on SendSearchEngines=" + text);
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent("SendSearchEngines", true, true, text);
            document.documentElement.dispatchEvent(event);
        });

document.documentElement.addEventListener("RequesSearchEngines", function(event) {
  console.log("RequestSearchEngines=" + event.detail);
  self.port.emit("RequestSearchEngines", event.detail);
  
}, false);


document.documentElement.addEventListener("StoreData", function(event) {
  console.log("StoreData=" + event.detail);
  self.port.emit("StoreData", event.detail);
  
}, false);

document.documentElement.addEventListener("ShowToolTip", function(event) {
  console.log("ShowToolTip=" + event.detail);
  self.port.emit("ShowToolTip", event.detail);
  
}, false);

//document.documentElement.addEventListener("RequesLocalizeStrings", function(event) {
 // console.log("RequesLocalizeStrings=" + event.detail);
 // self.port.emit("RequesLocalizeStrings", event.detail);
//  
//}, false);

//self.port.on("GetLocalizeStrings", function(text) {
 //           console.log("self.port.on GetLocalizeStrings=" + text);
  //          var event = document.createEvent('CustomEvent');
   //         event.initCustomEvent("GetLocalizeStrings", true, true, text);
   //         document.documentElement.dispatchEvent(event);
   //     });
  
  