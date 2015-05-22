if ("undefined" == typeof(CloudMagic)) {
    var CloudMagic = {};
};


CloudMagic.StyleSanitizer = function(value) {
		var allowablecsslist1 = new Array(/(\w\/\/)/i, /(\w\/\/*\*)/i, /(\/\*\/)/i);

		var allowablecsslist2 = new Array(/(eval|cookie|\bwindow\b|\bparent\b|\bthis\b)/i, //suspicious javascript-type words
		/behaviou?r|expression|moz-binding|@import|@charset|(java|vb)?script|[\<]|\\\w/i, /[\<>]/i, // back slash, html tags,
		/[\x7f-\xff]/i, // high bytes -- suspect
		/[\x00-\x08\x0B\x0C\x0E-\x1F]/i, //low bytes -- suspect
		/&\#/i // bad charset
		);
		var i;
		var len = allowablecsslist1.length;
		var pattern;

		if(value == undefined || value == null) {
			return " ";
		}

		for( i = 0; i < len; i++) {
			pattern = allowablecsslist1[i];
			if(pattern.test(value) == true) {
				return " ";
			}
		}
		value = value.replace(/(\/\*.*?\*\/)/, "");
		value = value.replace("\n", "");
		len = allowablecsslist2.length;

		for( i = 0; i < len; i++) {
			pattern = allowablecsslist2[i];
			if(pattern.test(value) == true) {
				return " ";
			}
		}
                                                               
        // This is done to remove any unnecessary spaces and newlines in the
        // inline CSS styles. Test case: Uber ride receipt
        value = value.replace(/\n\s\s+/g, ' ');
		return value;
	};

CloudMagic.HTMLSanitizerWrapper = function(emailcontent) {
                                                            
         try {
        // remove CDATA as we are not supporting it. Our parsing will fail if the CDATA contains any tags which are ignored
        emailcontent = emailcontent.replace( /<!\[CDATA\[[\s\S]*?\]\]>/gi, '');
                                                               
        // to support old style css handling, details here: http://stackoverflow.com/questions/8695031/why-is-there-often-a-inside-the-style-tag
        // bug fix. In case of MSO conditional comment, the comments are coming nested with combination of old style and new style STYLE tags. This can cause regex to malform the html.
        emailcontent = emailcontent.replace(/(<style[^>]*?>)(<!--)([^<]*?)(-->)(<\/style>)/gi, "$1 $3 $5");
                                                               
		emailcontent = CloudMagic.HTMLSanitizer.sanitize(emailcontent, function(ahref) {

			console.log("HREF: " + ahref);
			//http://daringfireball.net/2010/07/improved_regex_for_matching_urls
			//var patt1 = /(?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?������])/i;
			var patt1 = /^(\s)*(ftp|http|https|itms-services):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
			var patt2 = /^mailto:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i;
			var patt3 = /^callto:/i;
			var patt4 = /^www./i;
			var patt5 = /^tel:/i;
            var patt6 = /^cid:/i;
            var patt7 = /\b[^:]{1,15}:\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
			var patt8 = /^data:/i;
			if(patt1.test(ahref) != true && patt2.test(ahref) != true && patt3.test(ahref) != true && patt4.test(ahref) != true && patt5.test(ahref) != true && patt6.test(ahref) != true && patt8.test(ahref) != true) {
				if((patt7.test(ahref) != true) || (ahref.substring(0,10).toLowerCase() == "javascript")){
                    ahref = "about:blank";
                }
			}
			return ahref;
		}, null, CloudMagic.StyleSanitizer);
		return emailcontent;
                                                               } catch (e) {
                                                               alert(e);
                                                               }
	};
