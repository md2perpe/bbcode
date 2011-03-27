/* ***************
Desc: Installation script For Mozilla Suite, Firefox prior to 0.9 and thunderbird prior to 0.7
Author: Jed Brown (jedbro@gmx.net)
****************** */
const author              = "Mel Reyes";
const displayName         = "BBCode";
const name                = "bbcode";
const version             = "0.5.x";
var contentFlag           = CONTENT | PROFILE_CHROME;
var error                 = null;
var folder                = getFolder("Profile", "chrome");
var localeFlag            = LOCALE | PROFILE_CHROME;
var skinFlag              = SKIN | PROFILE_CHROME;
var jarName               = name + ".jar";
var existsInApplication   = File.exists(getFolder(getFolder("chrome"), jarName));
var existsInProfile       = File.exists(getFolder(folder, jarName));
const SUCCESS_MESSAGE     = " has been installed";

initInstall(displayName, name, version);

// If the extension exists in the application folder or it doesn't exist in the profile folder and the user doesn't want it installed to the profile folder
if(existsInApplication || (!existsInProfile && !confirm("Do you want to install the extension into your profile folder?\n(Cancel will install into the application folder)")))
{
    contentFlag = CONTENT | DELAYED_CHROME;
    folder      = getFolder("chrome");
    localeFlag  = LOCALE | DELAYED_CHROME;
    skinFlag    = SKIN | DELAYED_CHROME;
}

setPackageFolder(folder);
error = addFile(author, version, 'chrome/' + jarName, folder, null);
// If adding the JAR file succeeded
if(error == SUCCESS)
{
    folder = getFolder(folder, jarName);
    registerChrome(contentFlag, folder, "content/bbcode/");
    registerChrome(localeFlag, folder, "locale/en-US/bbcode/");
    registerChrome(localeFlag, folder, "locale/ca-AD/bbcode/");
    registerChrome(localeFlag, folder, "locale/cs-CZ/bbcode/");
    registerChrome(localeFlag, folder, "locale/de-DE/bbcode/");
    registerChrome(localeFlag, folder, "locale/es-ES/bbcode/");
    registerChrome(localeFlag, folder, "locale/fr-FR/bbcode/");
    registerChrome(localeFlag, folder, "locale/hu-HU/bbcode/");
    registerChrome(localeFlag, folder, "locale/it-IT/bbcode/");
    registerChrome(localeFlag, folder, "locale/ja-JP/bbcode/");
    registerChrome(localeFlag, folder, "locale/nl-NL/bbcode/");
    registerChrome(localeFlag, folder, "locale/ru-RU/bbcode/");
    registerChrome(localeFlag, folder, "locale/pt-BR/bbcode/");
    registerChrome(localeFlag, folder, "locale/sv-SE/bbcode/");
    registerChrome(localeFlag, folder, "locale/zh-TW/bbcode/");
    registerChrome(skinFlag, folder, "skin/classic/bbcode/");

    var prefFolder = getFolder('Program','defaults/pref/');
    addFile(author, "defaults/preferences/bbcode.js", prefFolder, null);
    
    error = performInstall();

    // If the install failed
    if(error == SUCCESS || error == 999)
    {
      alert(displayName+" "+version+" has been succesfully installed.\n"+displayName + SUCCESS_MESSAGE);
    }else{
      alert("Install failed. Error code:" + error);
      cancelInstall(error);
    }
}
else
{
	alert("The installation of the extension failed.\n" + error + "\n Failed to create " +jarName+ " \n"
	      +"Make sure you have the correct permissions");
	cancelInstall(error);
}
