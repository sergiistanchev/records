(function( acx ) {

    acx.ux.WalkmeService = acx.ux.Observable.extend({
        defaults: {
            url: "",
            global: window.top
        },
        init: function() {
            this._super();
            this.readyCallbacks = [];
            this.readyState = 0;

            if( this.config.url ) {
                this._loadWalkme();
			}

			this._getWalkmeCookie();
        },

		_getWalkmeCookie: function() {
			try {
				var match = this.config.global.document.cookie.match(/wm-prsst=([^;]+)/);
				if( match ) {
					var wmcookie = JSON.parse(decodeURIComponent(match[1]));
					if( wmcookie && wmcookie.sst !== 0 ) {
						this._ensureWalkmeStarted();
					}
				}
			} catch(e) { }
		},

        _loadWalkme: function() {
            var global = this.config.global;

            global.walkme_load_in_iframe = true;
            global.walkme_get_language = this._walkmeGetLanguage_handler.bind(this);
            global.walkme_player_event = this._playerEvent_handler.bind(this);
            global.walkme_ready = this._ready_handler.bind(this);

            this.on('PlayerInitComplete', function() {
                var walkmePlayerAPI = global.WalkMePlayerAPI;
                if (walkmePlayerAPI !== undefined) {
                    walkmePlayerAPI.removeWalkthruPlayer();
                }
            }.bind(this));

            global["walkmeService"] = this;
            if( global.document.location.href.indexOf("walkme") !== -1 ) {
                this._ensureWalkmeStarted();
            }
            return this;
        },

        getWalkthrus: function(callback) {
            this._getWalkmeApi( function( walkmeAPI ) {
                callback( walkmeAPI.getWalkthrus( true ).filter(function( walk ){
                    return walk.ConditionsPassed;
                } ) );
            } );
        },

        startWalkthruById: function(id, callback){
            this._getWalkmeApi( function( walkmeAPI ) {
                walkmeAPI.startWalkthruById( id );
                if (acx.isFunction(callback)) {
                    callback();
                }
            });
        },

        _ensureWalkmeStarted: function() {
            if( this.readyState === 0 && this.config.url ) {
                this.config.global.walkme_userid = acx.session.getUserId();
                var s = document.createElement("script");
                s.async = true;
                s.src = this.config.url;
                s.type = "text/javascript";
                this.config.global.document.getElementsByTagName("script")[0].parentNode.appendChild( s );
                this.readyState = 1;
            }
        },

        _walkmeGetLanguage_handler: function() {
            var language = acx.session.getLocale().language;
            return (language === "en") ? "" : language;
        },

        _ready_handler: function() {
            this.readyState = 4;
            this.walkmeAPI = this.config.global.WalkMeAPI;
            while( this.readyCallbacks.length ) {
                this.readyCallbacks.pop().call( this, this.walkmeAPI );
            }
            delete this.config.global.walkme_ready;
        },

        _playerEvent_handler: function(eventData) {
            this.fire( eventData.Type );
        },

        _getWalkmeApi: function( callback ) {
            try {
                if( this.readyState === 4 ) {
                    return callback( this.walkmeAPI );
                }
                this.readyCallbacks.push( callback );
                this._ensureWalkmeStarted();
            } catch(e) { window.console && window.console.log(e); }
        }
    });
})( window.acx );
