/* ***************
// bbcode.js
// Main implementation file for BBCode  <http://extensions.jedbrown.net/>
//
// Original code: BBCode Extension (http://extensions.jedbrown.net/)
// Author: Jed Brown (mozilla@jedbrown.net)
// Contributors:
//   - Ronny Perinke
//   - Cusser
//   - Patrick Wildenborg (gtafcode@patrickw.gtacrime.nl)
//   - Simon Willison
//   - Mark Wilton-Jones
//
// License:
// See license.txt file from the original .xpi.
//
// TO USE THIS CODE YOU MUST ABIDE BY THE LICENSE
****************** */
var BBCode_Color;
var BBCode_Size;
var BBCode_enableBBCode;
var BBCode_enableXHTML;
var BBCode_enableHTML;
var BBCode_enableSYMBOL;
var BBCode_enableCustomCode;
var BBCode_stringBundle;
var BBCode_Document = null;
var gBBCodePromptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
var gBBCInput = {value: ""};

var bbcode = {
  _title : 'BBCode Prompt',
  
  init: function() {

    bbcode.BBCodeSetupDocument(document);
    bbcode.GetUserPrefs();

    var thisContextMenu = document.getElementById('contentAreaContextMenu');

    if (thisContextMenu) {
      thisContextMenu.addEventListener('popupshowing', bbcode.showHide, false);
    }
  },
  
  unInit: function() {
    try {
    thisContextMenu.removeEventListener('popupshowing', bbcode.showHide, false);
    } catch (ex) {
    }
  },

  showHide: function() {
    var contextUndo = document.getElementById('context-undo').hidden;
    document.getElementById('context-bbcode-main').hidden = contextUndo;
    
    if(BBCode_enableBBCode){
      document.getElementById('context-bbcode').hidden = contextUndo;
    }else{
      document.getElementById('context-bbcode').hidden = true;
    }
    if(BBCode_enableXHTML){
      document.getElementById('context-bbcode-xhtml').hidden = contextUndo;
    }else{
      document.getElementById('context-bbcode-xhtml').hidden = true;
    }
    if(BBCode_enableHTML){
      document.getElementById('context-bbcode-html').hidden = contextUndo;
    }else{
      document.getElementById('context-bbcode-html').hidden = true;
    }
    if(BBCode_enableSYMBOL){
      document.getElementById('context-bbc-symbols').hidden = contextUndo;
    }else{
      document.getElementById('context-bbc-symbols').hidden = true;
    }
    if(BBCode_enableCustomCode){
        var theNumber = nsPreferences.getIntPref('bbcode.tags.custom.number');
        if(!contextUndo && theNumber > 0 ){
            document.getElementById('context-bbc-custom').hidden = false;
        }else{
            document.getElementById('context-bbc-custom').hidden = true;
        }
    }else{
      document.getElementById('context-bbc-custom').hidden = true;
    }
    //context-bbc-symbols
  },

  bbcode: function(myCommand, codeType, mycustomstring) {
    var clip = Components.classes["@mozilla.org/widget/clipboard;1"].createInstance(Components.interfaces.nsIClipboard);
    if (!clip){
      return false;
    }
    
    var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
    if (!trans){
      return false;
    }
    
    trans.addDataFlavor("text/unicode");
    clip.getData(trans,clip.kGlobalClipboard);

    var str = null;
    var str_clipboard=new Object();
    var strLength=new Object();
    try{
      trans.getTransferData("text/unicode",str_clipboard,strLength);
  
  
      if (str_clipboard){
        str_clipboard=str_clipboard.value.QueryInterface(Components.interfaces.nsISupportsString);
      }
      if (str_clipboard){
        var pastetext=str_clipboard.data.substring(0,strLength.value / 2);
      }
    }catch (e){
      //alert("No text in the clipboard, please copy something first.");
    }
    
    var theBox = document.commandDispatcher.focusedElement;
    var oPosition = theBox.scrollTop;
    var oHeight = theBox.scrollHeight;
    
    
    //Get Selected text (if selected)
    var startPos = theBox.selectionStart;
    var endPos = theBox.selectionEnd;
    str = theBox.value.substring(startPos, endPos);
    
    //alert("Str: " +str);
 
    switch (codeType) {
      case "bbcode":
        bbcode.insertAtCursorSetup(myCommand, str_clipboard, str, theBox, mycustomstring);
        break;
      case "html":
        bbcode.insertAtCursorSetupHTML(myCommand, str_clipboard, str, theBox);
        break;
      case "xhtml":
        bbcode.insertAtCursorSetupXHTML(myCommand, str_clipboard, str, theBox);
        break;
      case "symbol":
        bbcode.insertAtCursorSetupSYMBOL(myCommand, str_clipboard, str, theBox);
        break;
      case "bbcode-direct":
        bbcode.insertAtCursor( " " + myCommand + " ");
        break;
      default:
        alert("Error #1");
    }

    var nHeight = theBox.scrollHeight - oHeight;
    theBox.scrollTop = oPosition + nHeight;

    return true;
  },
  
  insertAtCursorSetup: function(myCommand, str_clipboard, str, theBox, mycustomstring) {
    var bold = "[b]";
    var boldend="[\/b]";
    var color = "[color=";
    var color2 = "]";
    var colorend = "[\/color]";
    var colorend2 = "[/color]";
    var select_flag = (str != "")

    switch (myCommand){
      case "quoteclip":
        bbcode.insertAtCursor("[quote]" + str_clipboard + "[/quote]");
        break;
        
      case "quote":
        bbcode.insertAtCursorEx("[quote]" + str,"[/quote]",select_flag);
        break;
        
      case "img":
        bbcode.insertAtCursor("[img]" + str_clipboard + "[/img]");
        break;
        
      case "url":
        bbcode.insertAtCursor("[url]" + str_clipboard + "[/url]");
        break;
        
      case "urlclip":
        bbcode.insertAtCursorEx("[url=" + str_clipboard + "]" + str,"[/url]",select_flag);
        break;
        
      case "bold":
        bbcode.insertAtCursorEx("[b]" + str,"[/b]",select_flag);
        break;
        
      case "italic":
        bbcode.insertAtCursorEx("[i]" + str,"[/i]",select_flag);
        break;
        
      case "underline":
        bbcode.insertAtCursorEx("[u]" + str,"[/u]",select_flag);
        break;
        
      case "code":
        bbcode.insertAtCursorEx("[code]" + str,"[/code]",select_flag);
        break;
        
      case "urlcode":
        bbcode.insertAtCursor("[code]" + str_clipboard + "[/code]");
        break;
        
      case "list":
        str = str.replace(/^\s{0,}[\*|\-|\#]\s{0,}/, "");
        str = str.replace(/\n\s{0,}[\*|\-|\#]\s{0,}/g, "\n");
        str = str.replace(/\n/g, "\n[*] ");
        bbcode.insertAtCursor("[list][*] "  + str + "[/list]");
        break;  
      
      case "size":
        var re = [];
        var bbcodesize = [BBCode_Size];
        window.openDialog("chrome://bbcode/content/bbcodesize.xul", "BBCodeSize","chrome,modal,centerscreen",re,bbcodesize);
        if(re[0]){
          bbcode.insertAtCursorEx("[size=" + bbcodesize[0] + "]" + str,"[/size]",select_flag);
          BBCode_Size = bbcodesize[0];
        }
        break;

      case "color":
        var re = [];
        var bbcoedcolor = [BBCode_Color];
        window.openDialog("chrome://bbcode/content/bbcodecolor.xul", "BBCodeColor","chrome,modal,centerscreen",re,bbcoedcolor);
        if(re[0]){
          bbcode.insertAtCursorEx("[color=" + bbcoedcolor[0] + "]" + str,"[/color]",select_flag);
          BBCode_Color = bbcoedcolor[0];
        }
        break;
        
      case "custom":
        var dateTimeService = Components.classes["@mozilla.org/intl/scriptabledateformat;1"].getService(Components.interfaces.nsIScriptableDateFormat);
    		var timeStamp = new Date();
    		var date = dateTimeService.FormatDate("", dateTimeService.dateFormatShort, timeStamp.getFullYear(), timeStamp.getMonth()+1, timeStamp.getDate());
    		var time = dateTimeService.FormatTime("", dateTimeService.timeFormatNoSeconds, timeStamp.getHours(), timeStamp.getMinutes(), timeStamp.getSeconds());
        var tempValue = this.replaceText(mycustomstring,"_date_", date);
      	var tempValue = this.replaceText(tempValue,"_time_", time);
        var tempValue = this.replaceText(tempValue,"_value_",str);
        var tempValue = this.replaceText(tempValue,"_clipboard_",str_clipboard);
        //bbcode.insertAtCursorEx("[code]" + str,"[/code]",select_flag);
        
        bbcode.insertAtCursorEx( tempValue, "", select_flag );
        break;
        
      case "syntaxjs":
        var theCode = this.syntaxjs( str, bold, boldend, color, color2, colorend, colorend2 );
        bbcode.insertAtCursor( theCode );
        break;
        
      case "syntaxcss":
        var theCode = this.syntaxcss( str, bold, boldend, color, color2, colorend, colorend2 );
        bbcode.insertAtCursor( theCode );
        break;
        
      case "syntaxxml":
        var theCode = this.syntaxxml( str, bold, boldend, color, color2, colorend, colorend2 );
        bbcode.insertAtCursor( theCode );
        break;
        //End BBCODE
        
      default : 
        var alertText = BBCode_stringBundle.getString("bbcode.option.err");
        alert(alertText);
        
    }
  },

  insertAtCursorSetupHTML: function(myCommand, str_clipboard, str, theBox) {
    var bold = "<b>";
    var boldend="<\/b>";
    var color = "<font color=\"";
    var color2 = "\">";
    var colorend = "<\/font>";
    var colorend2 = "</font>";
    var select_flag = (str != "")

    switch (myCommand){
      case "img":
        bbcode.insertAtCursor("<img src=\"" + str_clipboard + "\"/>");
        break;
        
      case "imgalt":
        var alertText = BBCode_stringBundle.getString("bbcode.img.alttext");
        gBBCodePromptService.prompt(window, this._title, alertText, gBBCInput, null, {value:0});
        bbcode.insertAtCursor("<img src=\"" + str_clipboard + "\"" + " alt=\"" + gBBCInput.value + "\"/>");
        break;
      
      case "mail":
        bbcode.insertAtCursor("<a href=\"mailto:" + str_clipboard + "\">" + str_clipboard + "</a>");
        break;
        
      case "mailclip":
        bbcode.insertAtCursorEx("<a href=\"mailto:" + str_clipboard + "\">" + str,"</a>",select_flag);
        break;
        
        
      case "url":
        bbcode.insertAtCursorEx("<a href=\"\">" + str,"</a>",select_flag);
        break;
        
       case "urltitle":
        var alertText = BBCode_stringBundle.getString("bbcode.url.title");
        gBBCodePromptService.prompt(window, this._title, alertText, gBBCInput, null, {value:0});
        bbcode.insertAtCursorEx("<a href=\"\" title=\""+ gBBCInput.value + "\">" + str,"</a>",select_flag);
        break;
        
      case "urlclip":
        bbcode.insertAtCursorEx("<a href=\"" + str_clipboard + "\">" + str,"</a>",select_flag);
        break;
        
      case "urlcliptitle":
        var alertText = BBCode_stringBundle.getString("bbcode.url.title");
        gBBCodePromptService.prompt(window, this._title, alertText, gBBCInput, null, {value:0});
        bbcode.insertAtCursorEx("<a href=\"" + str_clipboard + "\" title=\""+ gBBCInput.value + "\">" + str,"</a>",select_flag);
        break;
        
      case "bold":
        bbcode.insertAtCursorEx("<b>" + str,"</b>",select_flag);
        break;
        
      case "italic":
        bbcode.insertAtCursorEx("<i>" + str,"</i>",select_flag);
        break;
        
      case "underline":
        bbcode.insertAtCursorEx("<u>" + str,"</u>",select_flag);
        break;
      
      case "strike":
        bbcode.insertAtCursorEx("<strike>" + str,"</strike>",select_flag);
        break;
      
      case "blockquote":
        bbcode.insertAtCursorEx("<blockquote>" + str,"</blockquote>",select_flag);
        break;
      
      case "list":
        str = str.replace(/^\s{0,}[\*|\-|\#]\s{0,}/, "");
        str = str.replace(/\n\s{0,}[\*|\-|\#]\s{0,}/g, "\n");
        str = str.replace(/\n/g, "\n<li> ");
        str = str.replace(/\n/g, "</li>\n ");
        bbcode.insertAtCursor("<ul><li> "  + str + "</li></ul>");
        break;  
        
      case "size":
        var re = [];
        var bbcodesize = [BBCode_Size];
        window.openDialog("chrome://bbcode/content/bbcodesize.xul", "BBCodeSize","chrome,modal,centerscreen",re,bbcodesize);
        if(re[0]){
          bbcode.insertAtCursorEx("<font size=\"" + bbcodesize[0] + "px\">" + str,"</font>",select_flag);
          BBCode_Size = bbcodesize[0];
        }
        break;

      case "color":
        var re = [];
        var bbcoedcolor = [BBCode_Color];
        window.openDialog("chrome://bbcode/content/bbcodecolor.xul", "BBCodeColor","chrome,modal,centerscreen",re,bbcoedcolor);
        if(re[0]){
          bbcode.insertAtCursorEx("<font color=\"" + bbcoedcolor[0] + "\">" + str,"</font>",select_flag);
          BBCode_Color = bbcoedcolor[0];
        }
        break;
        
      case "syntaxjs":
        var theCode = this.syntaxjs( str, bold, boldend, color, color2, colorend, colorend2 );
        bbcode.insertAtCursor( theCode );
        break;
        
      case "syntaxcss":
        var theCode = this.syntaxcss( str, bold, boldend, color, color2, colorend, colorend2 );
        bbcode.insertAtCursor( theCode );
        break;
        
      case "syntaxxml":
        var theCode = this.syntaxxml( str, bold, boldend, color, color2, colorend, colorend2 );
        bbcode.insertAtCursor( theCode );
        break;
        
      default : 
        var alertText = BBCode_stringBundle.getString("bbcode.option.err");
        alert(alertText);
    }
  },

  insertAtCursorSetupXHTML: function(myCommand, str_clipboard, str, theBox) {
    var bold = "<strong>";
    var boldend="<\/strong>";
    var color = "<span style=\"color: ";
    var color2 = "\">";
    var colorend = "<\/span>";
    var colorend2 = "</span>";
    var select_flag = (str != "")

    switch (myCommand){
        
      case "img":
        bbcode.insertAtCursor("<img src=\"" + str_clipboard + "\"/>");
        break;
        
      case "imgalt":
        var alertText = BBCode_stringBundle.getString("bbcode.img.alttext");
        gBBCodePromptService.prompt(window, this._title, alertText, gBBCInput, null, {value:0});
        bbcode.insertAtCursor("<img src=\"" + str_clipboard + "\"" + " alt=\"" + gBBCInput.value + "\"/>");
        break;
        
      case "mail":
        bbcode.insertAtCursor("<a href=\"mailto:" + str_clipboard + "\">" + str_clipboard + "</a>");
        break;
        
      case "mailclip":
        bbcode.insertAtCursorEx("<a href=\"mailto:" + str_clipboard + "\">" + str,"</a>",select_flag);
        break;
        
      case "url":
        bbcode.insertAtCursorEx("<a href=\"\">" + str,"</a>",select_flag);
        break;
        
       case "urltitle":
        var alertText = BBCode_stringBundle.getString("bbcode.url.title");
        gBBCodePromptService.prompt(window, this._title, alertText, gBBCInput, null, {value:0});
        bbcode.insertAtCursorEx("<a href=\"\" title=\""+ gBBCInput.value + "\">" + str,"</a>",select_flag);
        break;
        
      case "urlclip":
        bbcode.insertAtCursorEx("<a href=\"" + str_clipboard + "\">" + str,"</a>",select_flag);
        break;
        
      case "urlcliptitle":
        var alertText = BBCode_stringBundle.getString("bbcode.url.title");
        gBBCodePromptService.prompt(window, this._title, alertText, gBBCInput, null, {value:0});
        bbcode.insertAtCursorEx("<a href=\"" + str_clipboard + "\" title=\""+ gBBCInput.value + "\">" + str,"</a>",select_flag);
        break;
        
      case "bold":
        bbcode.insertAtCursorEx("<strong>" + str,"</strong>",select_flag);
        break;
        
      case "italic":
        bbcode.insertAtCursorEx("<em>" + str,"</em>",select_flag);
        break;
        
      case "underline":
        bbcode.insertAtCursorEx("<ins>" + str,"</ins>",select_flag);
        break;
      
      case "strike":
        bbcode.insertAtCursorEx("<del>" + str,"</del>",select_flag);
        break;
      
      case "blockquote":
        bbcode.insertAtCursorEx("<blockquote>" + str,"</blockquote>",select_flag);
        break;
      
      case "list":
        str = str.replace(/^\s{0,}[\*|\-|\#]\s{0,}/, "");
        str = str.replace(/\n\s{0,}[\*|\-|\#]\s{0,}/g, "\n");
        str = str.replace(/\n/g, "\n<li> ");
        str = str.replace(/\n/g, "</li>\n ");
        bbcode.insertAtCursor("<ul><li> "  + str + "</li></ul>");
        break;  
        
      case "size":
        var re = [];
        var bbcodesize = [BBCode_Size];
        window.openDialog("chrome://bbcode/content/bbcodesize.xul", "BBCodeSize","chrome,modal,centerscreen",re,bbcodesize);
        if(re[0]){
          bbcode.insertAtCursorEx("<span style=\"font-size: " + bbcodesize[0] + "px\">" + str,"</span>",select_flag);
          BBCode_Size = bbcodesize[0];
        }
        break;

      case "color":
        var re = [];
        var bbcoedcolor = [BBCode_Color];
        window.openDialog("chrome://bbcode/content/bbcodecolor.xul", "BBCodeColor","chrome,modal,centerscreen",re,bbcoedcolor);
        if(re[0]){
          bbcode.insertAtCursorEx("<span style=\"color: " + bbcoedcolor[0] + "\">" + str,"</span>",select_flag);
          BBCode_Color = bbcoedcolor[0];
        }
        break;
        
      case "syntaxjs":
        var theCode = this.syntaxjs( str, bold, boldend, color, color2, colorend, colorend2 );
        bbcode.insertAtCursor( theCode );
        break;
        
      case "syntaxcss":
        var theCode = this.syntaxcss( str, bold, boldend, color, color2, colorend, colorend2 );
        bbcode.insertAtCursor( theCode );
        break;
        
      case "syntaxxml":
        var theCode = this.syntaxxml( str, bold, boldend, color, color2, colorend, colorend2 );
        bbcode.insertAtCursor( theCode );
        break;
        
      default : 
        var alertText = BBCode_stringBundle.getString("bbcode.option.err");
        alert(alertText);
    }
  },
  
  //Symbol Insertion
  insertAtCursorSetupSYMBOL: function(myCommand, str_clipboard, str, theBox) {
    switch (myCommand){
        
      case "copyr":
        bbcode.insertAtCursor("&copy;");
        break;
        
      case "reg":
        bbcode.insertAtCursor("&reg;");
        break;
        
      case "tm":
        bbcode.insertAtCursor("&trade;");
        break;
        
      case "euro":
        bbcode.insertAtCursor("&euro;");
        break;
        
      case "cent":
        bbcode.insertAtCursor("&cent;");
        break;
        
      case "pound":
        bbcode.insertAtCursor("&pound;");
        break;
        
      case "a":
        bbcode.insertAtCursor("&ordf;");
        break;
        
      case "degree":
        bbcode.insertAtCursor("&deg;");
        break;
        
      case "square":
        bbcode.insertAtCursor("&sup2;");
        break;
        
      case "cubed":
        bbcode.insertAtCursor("&sup3;");
        break;
        
      case "oneforth":
        bbcode.insertAtCursor("&frac14;");
        break;
        
      case "onehalf":
        bbcode.insertAtCursor("&frac12;");
        break;
        
      case "threeforth":
        bbcode.insertAtCursor("&frac34;");
        break;
        
      case "divide":
        bbcode.insertAtCursor("&divide;");
        break;
        
      case "plusminus":
        bbcode.insertAtCursor("&plusmn;");
        break;
        
      default : 
        var alertText = BBCode_stringBundle.getString("bbcode.option.err");
        alert(alertText);
    }
  },
  
  /*insertAtCursor_old: function(myField, myValue) { // NO LONGER USED IN BBCODE, here for reference only.
  // Function taken from http://www.alexking.org/blog/2003/06/02/inserting-at-the-cursor-using-javascript/
  // Modified to return cursor to correct place
    if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart;
      var endPos = myField.selectionEnd;
      myField.value = myField.value.substring(0, startPos)
      + myValue
      + myField.value.substring(endPos, myField.value.length);
      var cursorPos = endPos + myValue.length;
      myField.selectionStart = cursorPos;
      myField.selectionEnd = cursorPos;
    } 
    else {
      myField.value += myValue;
    }
  },*/
  
  //Thanks to Nick (asquella) for pointing out this function to me
  insertAtCursor: function( aText) {
    try {
      var command = "cmd_insertText";
      var controller = document.commandDispatcher.getControllerForCommand(command);
      if (controller && controller.isCommandEnabled(command)) {
        controller = controller.QueryInterface(Components.interfaces.nsICommandController);
        var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
        params = params.createInstance(Components.interfaces.nsICommandParams);
        params.setStringValue("state_data", aText);
        controller.doCommandWithParams(command, params);
      }
    }catch (e) {
      dump("Can't do cmd_insertText! ");
      dump(e+"\n")
    }
  },
  //Original Function by Patrick Wildenborg

  insertAtCursorEx: function(aText, bText, selection) {
	  this.insertAtCursor(aText+bText);
      if ( selection ) {
		  this.reselectCursor(aText+bText);
	  } else {
	      this.backupCursor(bText);
	  }  
  },

  //Original Function by Asquella, modified by Patrick Wildenborg
  backupCursor: function(aText) {
    try {
      var command = "cmd_charPrevious";
      var controller = document.commandDispatcher.getControllerForCommand(command);
      if (controller && controller.isCommandEnabled(command)) {
        controller = controller.QueryInterface(Components.interfaces.nsICommandController);
        var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
        params = params.createInstance(Components.interfaces.nsICommandParams);
        var len = aText.length
        while( len-- > 0 ) {
	        controller.doCommand(command, params);
        }
      }
    }catch (e) {
      dump("Can't do cmd_insertText! ");
      dump(e+"\n")
    }
  },

  //Original Function by Asquella, modified by Patrick Wildenborg
  reselectCursor: function(aText) {
    try {
      var command = "cmd_selectCharPrevious";
      var controller = document.commandDispatcher.getControllerForCommand(command);
      if (controller && controller.isCommandEnabled(command)) {
        controller = controller.QueryInterface(Components.interfaces.nsICommandController);
        var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
        params = params.createInstance(Components.interfaces.nsICommandParams);
        var len = aText.length
        while( len-- > 0 ) {
	        controller.doCommand(command, params);
        }
      }
    }catch (e) {
      dump("Can't do cmd_insertText! ");
      dump(e+"\n")
    }
  },
  
  OpenSettings: function() {
    window.openDialog('chrome://bbcode/content/bbcode_settings.xul', '', 'width=400,height=500,chrome,modal,centerscreen,resizable');
  },

  //May not be needed, but just incase.
  BBCodeSetupDocument: function( aDoc ) {
    BBCode_Document = aDoc;
    BBCode_stringBundle = aDoc.getElementById("bbcstrings");
  },

  GetUserPrefs: function() {
    BBCode_Size = nsPreferences.copyUnicharPref("bbcode.font.size");
    BBCode_Color = nsPreferences.copyUnicharPref("bbcode.font.color");
    BBCode_enableBBCode = nsPreferences.getBoolPref("bbcode.contextmenu.bbcode");
    BBCode_enableXHTML = nsPreferences.getBoolPref("bbcode.contextmenu.xhtml");
    BBCode_enableHTML = nsPreferences.getBoolPref("bbcode.contextmenu.html");
    BBCode_enableSYMBOL = nsPreferences.getBoolPref("bbcode.contextmenu.symbol");
    BBCode_enableCustomCode = nsPreferences.getBoolPref("bbcode.contextmenu.custom");
  },
  
  PopulateCustomImages: function(event){
    var theNumber = nsPreferences.getIntPref('bbcode.tags.custom.number');
    var bbc_MainMenu = document.getElementById("bbcode_ct_custom_menu");

    while (bbc_MainMenu.hasChildNodes()) {
      bbc_MainMenu.removeChild(bbc_MainMenu.firstChild);
    }

    if (theNumber > 0) {
      //Add custom Entried  
      for (i=1; i <= theNumber; ++i) {

        var bcCustomLabel = unescape(nsPreferences.copyUnicharPref('bbcode.tags.custom.'+i+'.label'));
        var bcCustomImageURL = unescape(nsPreferences.copyUnicharPref('bbcode.tags.custom.'+i+'.url'));

        document.getElementById('context-bbc-custom').collapsed = false;

        var menuitem = document.createElement("menuitem");
        menuitem.setAttribute("label", bcCustomLabel + " "); // Add a space at the end to prevent theme conflicts (like profiles named "home")
        menuitem.setAttribute("id", "context-bbc-custom-" + i);
        menuitem.setAttribute("index", i);
        menuitem.setAttribute("oncommand", "bbcode.bbcode('custom', 'bbcode', '" + bcCustomImageURL + "');");
        bbc_MainMenu.appendChild(menuitem);
      }
    } else {
      document.getElementById('context-bbc-custom').collapsed = true;
    }

    return true;
  },

  // The following two functions are modified versions of the Syntax highlighter for JavaScript 
  // (1.2) script found at http://www.howtocreate.co.uk.
  inAr: function(oStr) {
    var opAr = new Array('+','-','*','%','=','+=','-=','&gt;','&lt;','&gt;=','&lt;=','++','--','==','!=','&lt;&lt;','&gt;&gt;','&amp;','|','^','~','!','&amp;&amp;','||','?',':');

  	for( var x = 0; x < opAr.length; x++ ) {
  		if( oStr.substr(0,opAr[x].length) == opAr[x] ) { 
        return opAr[x];
      } 
    }
	return false;
  },
  
  //replaceText(inString,oldText,newText);
  replaceText: function(inString,oldText,newText) {
    return (inString.split(oldText).join(newText));
  },
  
  syntaxjs: function( tForm, bold, boldend, color, color2, colorend, colorend2 ) {
    //start conversion by preparing variables
    var returnValue = bbcodeSyntax( "js", tForm, bold, boldend, color, color2, colorend, colorend2 );
    return returnValue;
  },

  syntaxcss: function( tForm, bold, boldend, color, color2, colorend, colorend2 ) {
    //start conversion by preparing variables
    var returnValue = bbcodeSyntax( "css", tForm, bold, boldend, color, color2, colorend, colorend2 );
    return returnValue;
  },
  
  syntaxxml: function( tForm, bold, boldend, color, color2, colorend, colorend2 ) {
    //start conversion by preparing variables
    var returnValue = bbcodeSyntax( "xml", tForm, bold, boldend, color, color2, colorend, colorend2 );
    return returnValue;
  }
}

//Make sure bbcode loads on start-up of browser.
window.addEventListener('load', bbcode.init, false); 
window.addEventListener('unload', bbcode.unInit, false); 
