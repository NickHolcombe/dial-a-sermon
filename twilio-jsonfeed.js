exports.handler = function(context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();
    var fetch = require('node-fetch');
    
    // Define the list of sermons and fetch the data
    const url = '<enter the URL of the json object to read>';
    fetch(url)
    .then(response => response.json())
    .then(function(data) {
        // Validate we have some sermon data
        const sermons = data.sermons;
        if (data === undefined || sermons === undefined || sermons.length === 0) {
            twiml.say({voice: 'alice', language: 'en-gb'}, 'Sorry an error occurred fetching the sermons');
    	    callback(null, twiml);
    	    twiml.hangup();
        }
        
        // Produce a menu based, on the sermons found, if no phone key(digit) was pressed...
        if (event.Digits === undefined || event.Digits > sermons.length) {
            const sermonMenu = sermons.map(sermon => 'Press '+sermon.id+' for '+sermon.title).join(",");
            twiml.gather({numDigits: 1})
            .say({voice: 'alice', language: 'en-gb'}, 'Welcome to All Saints Crow burra, '+sermonMenu)
        } else {
            // ... otherwise, get the right sermon based on the key pressed.
            const sermonIndex = event.Digits - 1;
            const sermon = sermons[sermonIndex];
            
            if (sermon === undefined) {
                twiml.say({voice: 'alice', language: 'en-gb'}, 'Sorry an error occurred fetching the sermons');
    	        callback(null, twiml);
    	        twiml.hangup();
            }
            
          	twiml.say({voice: 'alice', language: 'en-gb'}, 'Please wait whilst we fetch the sermon.');
    	    twiml.play(sermon.url);
    	    twiml.hangup();
        }
        callback(null, twiml);
    })
    .catch(function(error) {
        callback(error)
    })
};
