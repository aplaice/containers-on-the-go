var sNamePrefix = "CG ";

function handleBrowserAction() {
	browser.contextualIdentities.query( {} ).then(
		function( contexts ) {
			var sContextArr = new Array();
			for( let context of contexts )
				if( context.name.substr( 0, sNamePrefix.length ) == sNamePrefix )
					sContextArr.push( context.name );
			for( var i = 0; i < sContextArr.length + 1; i++ )
				if( sContextArr.indexOf( sNamePrefix + ( i + 1 ) ) == -1 )
					break;
			var sColors = [ "blue", "turquoise", "green", "yellow", "orange", "red", "pink", "purple" ];
			browser.contextualIdentities.create( { name: sNamePrefix + ( i + 1 ), color: sColors[ i % sColors.length ], icon: "circle" } ).then(
				function( context ) {
  					browser.tabs.create( { cookieStoreId: context.cookieStoreId } );
				}
			);
		}
	);
}

function handleRemoved( tabId, removeInfo ) {
	browser.contextualIdentities.query( {} ).then(
		function( contexts ) {
			var sCogStoreIdArr = new Array();
			for( let context of contexts )
				if( context.name.substr( 0,  sNamePrefix.length ) == sNamePrefix )
					sCogStoreIdArr.push( context.cookieStoreId );
			browser.cookies.getAllCookieStores().then(
				function( cookieStores ) {
					for( let store of cookieStores ) {
						let iIdx = sCogStoreIdArr.indexOf( store.id );
						if( iIdx != -1 && ( store.tabIds.length != 1 || store.tabIds[ 0 ] != tabId ) )
							sCogStoreIdArr.splice( iIdx, 1 );
					}
					for( var i = 0; i < sCogStoreIdArr.length; i++ )
						browser.contextualIdentities.remove( sCogStoreIdArr[ i ] );
				}
			);
		}
	);
}

browser.tabs.onRemoved.addListener( handleRemoved );
browser.browserAction.onClicked.addListener( handleBrowserAction );
