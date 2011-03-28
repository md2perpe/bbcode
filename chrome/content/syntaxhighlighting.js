function bbcodeSyntax( syntaxType, tForm, bold, boldend, color, color2, colorend, colorend2 ) {

  switch (syntaxType) {
    case "xml":
      // This is a modified version of the XML and CSS Syntax highlighter script.
      // Original Code written by Simon Willison, http://simon.incutio.com/
      tagRE = new RegExp('<([/a-z]+)([^&]*)>', 'g');
      attrRE = new RegExp('\\b([a-zA-Z]+)="([^"]+)"', 'g');
      tForm = tForm.replace(tagRE, function(text, tagname, rest) {
                /* This function gets a tag and must work out how to highlight it */
                // First highlight any attributes in 'rest'
                rest = rest.replace(attrRE, color+'red'+color2+'$1='+colorend2+color+'green'+color2+'"$2"'+colorend2);
                return color+'blue'+color2+'<'+tagname+colorend2+rest+color+'blue'+color2+'>'+colorend2;
              });
      break;

    case "css": 
      ruleRE = new RegExp('([^\\{]+)\\{([^\\}]+)\\}', 'g');
      idselectorRE = new RegExp('(#[a-zA-Z0-9]+)\\b', 'g');
      classselectorRE = new RegExp('(\\.[a-zA-Z0-9]+)\\b', 'g');
      pairRE = new RegExp('([a-zA-Z-]+):([^;]+);', 'g');
      tForm = tForm.replace(ruleRE, function(text, selector, body) {
      selector = selector.replace(idselectorRE, color+'red'+color2+'$1'+colorend2);
      selector = selector.replace(classselectorRE, color+'green'+color2+'$1'+colorend2);
      body = body.replace(pairRE, color+'blue'+color2+'$1'+colorend2+':'+color+'orange'+color2+'$2'+colorend2);
      return selector + '{' + body + '}';
      });

      break;

    case "js":
      // This is a modified version of the Syntax highlighter for JavaScript (1.2) script found at http://www.howtocreate.co.uk.
      // Original Code written by Mark Wilton-Jones
      // Please visit their page for Licensing information.
      var tempVal = tForm, newVal = ''; tempValOrig = tForm;
      /*span.comment { color: #008080; font-weight: normal; }
      span.oper { color: #0000f0; font-weight: normal; }
      span.var { color: #FF6600; font-weight: normal; }
      span.func { color: #6666CC; font-weight: normal; }
      span.string { color: #FF0000; font-weight: normal; }
      span.num { color: #990000; font-weight: bold; }
      span.reg { color: #8d7f07; font-weight: normal; }*/
      var oAmp = 'a', oRand = new Array('b','c'); //start conversion to HTML entities
      while( tempVal.indexOf(oAmp) + 1 ) { oAmp += oRand[Math.round(Math.random())]; }
      var fromAr = new Array('&',oAmp,'<','>','"'), toAr = new Array(oAmp,'&amp;','&lt;','&gt;','&quot;');
      for( var x = 0; x < fromAr.length; x++ ) { while(tempVal.indexOf(fromAr[x])+1) { tempVal = tempVal.replace(fromAr[x],toAr[x]); } }
      //tForm.toEnc.value = 'Please wait while I attempt to highlight your code . . .'; //start full conversion
      for( var x = 0; x < tempVal.length; x++ ) {
          if( tempVal.substr(x,1).replace(/[\w\+\-\*\/%=&\!\|\^~\'\"\?:]/,'') ) { newVal += tempVal.substr(x,1); } else {
              //This must be highlighted in some way
              if( !tempVal.substr(x,1).replace(/[a-zA-Z_]/,'') ) {
                  //variable or function or keyword or true/false/null
                  var tempKey = tempVal.substr(x).replace(/\W[\w\W]*/,'');
                  x += tempKey.length - 1; //the word is isolated and its length added
                  if( tempVal.substr(x).replace(/\w*\s*/,'').substr(0,1) == '(' ) {
                      //function/method or 'if' or 'for' or 'while' etc.
                      if( tempKey == 'for' || tempKey == 'if' || tempKey == 'while' || tempKey == 'switch' || tempKey == 'with' || tempKey == 'typeof' || tempKey == 'void' || tempKey == 'return' || tempKey == 'function' ) {
                          newVal += color+"#0000f0"+color2+tempKey+colorend;
                      } else { newVal += color+"#6666CC"+color2+tempKey+colorend;
                  } } else { //variable or keyword or true/false/null
                      if( tempKey == 'var' || tempKey == 'function' || tempKey == 'var' || tempKey == 'new' || tempKey == 'else' || tempKey == 'return' || tempKey == 'do' || tempKey == 'break' || tempKey == 'continue' || tempKey == 'case' || tempKey == 'default' || tempKey == 'in' || tempKey == 'delete' || tempKey == 'typeof' ) {
                          newVal += color+"#0000f0"+color2+tempKey+colorend;
                      } else { if( tempKey == 'true' || tempKey == 'false' || tempKey == 'null' ) {
                              newVal += bold+color+"#990000"+color2+tempKey+colorend+boldend;
                          } else { newVal += color+"#000000"+color2+tempKey+colorend; } } }
              } else { if( !tempVal.substr(x,1).replace(/[\d]/,'') ) { //numbers (+ & - signs are operators)
                      newVal += bold+color+"#990000"+color2+tempVal.substr(x).replace(/[^0-9.xE][\w\W]*/,'')+colorend+boldend;
                      x += tempVal.substr(x).replace(/[^0-9.xE][\w\W]*/,'').length - 1;
                  } else { //operators and comments and regexp and quotes
                      if( tempVal.substr(x,2) != '\/*' && tempVal.substr(x,2) != '\/\/' ) { //ops,regexp,',"
                          if( tempVal.substr(x,1) == "'" ) { var backSl = 0; //'string'
                              for( var y = 1; ( backSl%2 || tempVal.substr(y+x,1) != "'" ) && x+y < tempVal.length - 1; y++ ) {
                                  if( tempVal.substr(y+x,1) == '\\' && ( tempVal.substr(y+x+1,1) == '\\' || tempVal.substr(y+x+1,1) == "'" ) ) {
                                      backSl++; } else { backSl = 0; } }
                              newVal += color+"#FF0000"+color2+tempVal.substr(x+1,y-1)+colorend; x += y;
                          } else { if( tempVal.substr(x,6) == "&quot;" ) { var backSl = 0; //"string"
                                  for( var y = 1; ( backSl%2 || tempVal.substr(y+x,6) != "&quot;" ) && x+y < tempVal.length - 1; y++ ) {
                                      if( tempVal.substr(y+x,1) == '\\' && ( tempVal.substr(y+x+1,1) == '\\' || tempVal.substr(y+x+1,6) == "&quot;" ) ) {
                                          backSl++; } else { backSl = 0; } }
                                  newVal += '&quot;'+color+"#FF0000"+color2+tempVal.substr(x+6,y-6)+colorend+'&quot;'; x += y+5;
                              } else { if( bbcode.inAr(tempVal.substr(x)) ) { //ops, regexp
                                      newVal += color+"#0000f0"+color2+bbcode.inAr(tempVal.substr(x))+colorend;
                                      x += bbcode.inAr(tempVal.substr(x)).length - 1;
                                  } else { //regexp and /. divide preceeded by word or number or ) then any number of tabs or spaces
                                      for( var y = -1; x + y != 0 && ( tempVal.substr(x+y,1) == '\t' || tempVal.substr(x+y,1) == ' ' || tempVal.substr(x+y,1) == '\n' || tempVal.substr(x+y,1) == '\r' || tempVal.substr(x+y,1) == '\f' ); y-- ) {}
                                      if( !tempVal.substr(x+y,1).replace(/[\)\w\]]/,'') ) { newVal += color+"#0000f0"+color2+'\/'+colorend; //divide
                                      } else { var backSl = 0; //regexp
                                          for( var y = 1; ( backSl%2 || tempVal.substr(y+x,1) != '\/' ) && x+y < tempVal.length - 1; y++ ) {
                                              if( tempVal.substr(y+x,1) == '\\' && ( tempVal.substr(y+x+1,1) == '\\' || tempVal.substr(y+x+1,1) == '\/' ) ) {
                                                  backSl++; } else { backSl = 0; }
                                          } //now I have the regexp. I must also see if there is a g or gi or i after it
                                          newVal += '\/'+color+"#8d7f07"+color2+tempVal.substr(x+1,y-1)+colorend+'\/'; x += y; y = x;
                                          if( tempVal.substr(x+1,1) == 'g' || tempVal.substr(x+1,1) == 'i' ) { x++; }
                                          if( tempVal.substr(x+1,1) == 'g' || tempVal.substr(x+1,1) == 'i' ) { x++; } if( x > y ) {
                                              newVal += color+"#8d7f07"+color2+tempVal.substr(y+1,x-y)+colorend; } } } } }
                      } else { if( tempVal.substr(x,2) == '\/*' ) { //block comments
                              newVal += color+"#008080"+color2+tempVal.substr(x).replace(/\*\/[\w\W]*/,'')+'*\/'+colorend;
                              x += tempVal.substr(x).replace(/\*\/[\w\W]*/,'').length + 1;
                          } else { //one-line comments
                              newVal += color+"#8d7f07"+color2+tempVal.substr(x).replace(/[\n\r][\w\W]*/,'')+colorend;
                              x += tempVal.substr(x).replace(/[\n\r][\w\W]*/,'').length - 1; } } } } } }
      //tForm.toEnc.value = headers+newVal+footers;
      tForm = newVal;
      break;

    default:
      //alert("Error, no syntax type specified");
  }

  return tForm;

}
