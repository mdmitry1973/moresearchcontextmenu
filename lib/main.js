// The main module of the mdmitry1973 Add-on.

exports.main = function() {

    var contexMenu = require('context-menu');
    var selection = require('selection');
    var ss = require("sdk/simple-storage");
    var notifications = require("sdk/notifications");
	var _ = require("sdk/l10n").get;
    var menuItems = [];
	
    //create empty urls store
    if (!ss.storage.engines)
    {
        console.log("empty urls");
        ss.storage.engines = [];
        
        var objWikipedia = { label:   "Wikipedia",  
                            url:   "http://en.wikipedia.org/wiki/Special:Search?search={0}&sourceid=Mozilla-search"
        };
        
        var objGoogle = { label:   "Google",  
                            url:   "https://www.google.com/search?q={0}&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:official&client=firefox-a"
        };
        
        ss.storage.engines.push(objWikipedia);
        ss.storage.engines.push(objGoogle);
    }
    
    function ReInitMenu() 
    {
        for (var i = 0; i < menuItems.length; i++)
        {
            searchMenu.removeItem(menuItems[i]);
        }
        
        menuItems = [];

        for (var i = 0; i < ss.storage.engines.length; i++)
        {
            var menuItem = contexMenu.Item({
                label: ss.storage.engines[i].label,
                data: ss.storage.engines[i].url,
             });
             
             menuItems.push(menuItem);
        }
        
        for (var i = 0; i < menuItems.length; i++)
        {
            searchMenu.addItem(menuItems[i]);
        }
    }
        
    //panel for set up list of search engines
    var sp = require("sdk/simple-prefs");
    sp.on("EditSearchEngines", function() {
        
        console.log("EditSearchEngines");
        
        var panel = require("sdk/panel").Panel({
                height: 400,
                width: 600,
                contentURL: require("sdk/self").data.url("PrefUrlEditor.html"),
                contentScriptFile: require("sdk/self").data.url("PrefUrlEditor.js")
            });
            
        //panel.port.on("getUrls", function() {
        //    console.log("getUrls");
            
        //    return ss.storage;
        //});
        
        //panel.port.on("myAddonEvent", function(text) {
        //    console.log(text);
        //    panel.port.emit("myAddonEventBack", "Second message");
        //});
        
        panel.port.on("RequestSearchEngines", function(text) {
				console.log("port.on RequestSearchEngines=" + text);
                console.log("text == SearchEngines");
				
				var jsObject = JSON.parse(text);
				var arrLocalizeStrings = [];
			
				for (var i = 0; i < jsObject.length; i++)
				{
					console.log("jsObject[i]=" + jsObject[i]);
				   var new_text = _(jsObject[i]);
				   console.log("new_text=" + new_text);
				   arrLocalizeStrings.push(new_text);
				}
                
				var message = { engines:   ss.storage.engines,  
                            arrLocalizeStrings:   arrLocalizeStrings
				};
        
                //var jsonString = JSON.stringify(ss.storage.engines);
				var jsonString = JSON.stringify(message);
                panel.port.emit("SendSearchEngines", jsonString);
        });
        
         panel.port.on("StoreData", function(text) {
            console.log("port.on StoreData=" + text);
            
            ss.storage.engines = [];
            
            var jsObject = JSON.parse(text);
        
            for (var i = 0; i < jsObject.length; i++)
            {
                ss.storage.engines.push(jsObject[i]);
            }
            
            ReInitMenu();
        });
        
        panel.port.on("ShowToolTip", function(text) {
            console.log("port.on ShowToolTip=" + text);
            
            notifications.notify({
                        text: text
                });
        });
		
        panel.show();
    });
	
	sp.on("BackupData", function() {
        console.log("BackupData");
		console.log(sp.prefs.storeFile);
		var fileSDK = require("sdk/io/file");
		var jsonString = JSON.stringify(ss.storage.engines);
		//console.log(jsonString);
		var stream = fileSDK.open(sp.prefs.storeFile, "w");
		//console.log("stream");
		stream.write(jsonString);
		console.log("write");
		stream.close();
	});
		
	sp.on("RestoreData", function() {
        console.log("RestoreData");
		//console.log(sp.prefs.storeFile);
		var fileSDK = require("sdk/io/file");
		if (fileSDK.exists(sp.prefs.storeFile))
		{
			var data = fileSDK.read(sp.prefs.storeFile, "b");
			//console.log(data);
			
			if (data.length)
			{
				console.log("RestoreData2");
				ss.storage.engines = [];
				
				var jsObject = JSON.parse(data);
			
				for (var i = 0; i < jsObject.length; i++)
				{
					console.log(jsObject[i]);
					ss.storage.engines.push(jsObject[i]);
				}
				
				ReInitMenu();
				
				console.log("ReInitMenu");
			}
		}
	});
	
    var searchMenu = contexMenu.Menu({
        label: _("Search With"),
        context: contexMenu.SelectionContext(),
         contentScript: 'self.on("click", function(node, data){'+
        'var text = window.getSelection().toString();' +
        'console.log(text);' +
        'console.log(data);' +
        'text = text.replace(" ", "%20");' +
        'data = data.replace("{0}", text, "gi");' +
        'self.postMessage(data);' +
        '});',
      
        onMessage: function(text)
        {
            console.log("searchMenu onMessage");
            console.log(text.toString());
            
            if (text.legnth != 0)
            {
                var searchURL = text;
                console.log(searchURL);
				
				if (sp.prefs.openWindow)
				{
					var windows = require("sdk/windows").browserWindows;
					
					windows.open(searchURL);
				}
				else
				{
					var tabs = require("tabs");
					var currentIndex = tabs.activeTab.index;
					var length = tabs.length;
					tabs.open(searchURL);
					
					if (sp.prefs.nextCurrent)
					{
						tabs[length].index = currentIndex + 1;
					}
				}
            }
        }
    });
    
    ReInitMenu();
    
};
