exports.handler = function(context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();
    
    let Parser = require('rss-parser');
    let parser = new Parser();
    
    // Define the list of sermons and fetch the data
    const url = '<enter the URL of RSS feed to read>';
    parser.parseURL(url, function (err, feed) {
        if (err) {
            twiml.say({voice: 'alice', language: 'en-gb'}, 'Sorry an error occurred fetching the sermons');
    	    callback(err, twiml);
    	    twiml.hangup();
        }

        // Validate we have some sermon data
        const sermons = feed.items;
        if (feed === undefined || sermons === undefined || sermons.length === 0) {
            twiml.say({voice: 'alice', language: 'en-gb'}, 'Sorry an error occurred fetching the sermons');
    	    callback(null, twiml);
    	    twiml.hangup();
        }
        
        // Produce a menu based, on the sermons found, if no phone key(digit) was pressed...
        if (event.Digits === undefined || event.Digits === '*' || event.Digits > sermons.length) {
            const sermonMenu = sermons.map((sermon, index) => {
                const sermonTitle = sermon.itunes.author+' speaking on '+sermon.title;
                return 'Press '+index+' for '+sermonTitle
            }).join(",");
            const repeatInstructions = ', Press * to repeat these options';
            twiml.gather({numDigits: 1})
            .say({voice: 'alice', language: 'en-gb'}, 'Welcome to All Saints Crow burra, '+sermonMenu+repeatInstructions)
        } else {
            // ... otherwise, get the right sermon based on the key pressed.
            const sermonIndex = event.Digits;
            const sermon = sermons[sermonIndex];
            
            if (sermon === undefined) {
                twiml.say({voice: 'alice', language: 'en-gb'}, 'Sorry an error occurred fetching the sermons');
    	        callback(null, twiml);
    	        twiml.hangup();
            }
            
          	twiml.say({voice: 'alice', language: 'en-gb'}, 'Please wait whilst we fetch the sermon.');
    	    twiml.play(sermon.enclosure.url);
    	    twiml.hangup();
        }

        callback(null, twiml);
    });
};
