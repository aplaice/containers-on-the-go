const sNamePrefix = "CG ";
var bOpenLinkMenuItem = true;

browser.tabs.onRemoved.addListener( Tabs_OnRemoved );
browser.browserAction.onClicked.addListener( BrowserAction_OnClicked );
browser.runtime.onMessage.addListener( function( message, sender, sendResponse ) {
	switch( message.type ) {
		case "get_settings":
			sendResponse( { "bOpenLinkMenuItem": bOpenLinkMenuItem } );
			break;
		case "set_settings":
			bOpenLinkMenuItem = message[ "bOpenLinkMenuItem" ];
			browser.storage.local.set( { "bOpenLinkMenuItem": bOpenLinkMenuItem } );
			ContextMenuSetup();
			break;
	};
} )
browser.storage.local.get().then(
	function( value ) { 
			// del, old setting
		if( value.hasOwnProperty( "open_link_menuitem" ) ) {
			bOpenLinkMenuItem = value[ "open_link_menuitem" ];
			browser.storage.local.remove( "open_link_menuitem" );
			browser.storage.local.set( { "bOpenLinkMenuItem": bOpenLinkMenuItem } );
		}
		if( value.hasOwnProperty( "bOpenLinkMenuItem" ) )
			bOpenLinkMenuItem = value[ "bOpenLinkMenuItem" ];
		ContextMenuSetup();
	},
	function() { SetContextMenu(); }
);

function OpenNewTab( sUrl, bIncognito ) {
	browser.contextualIdentities.query( {} ).then(
		function( contexts ) {
			if( typeof contexts == "boolean" ) {
				browser.notifications.create( { type: "basic", message: "Please enable container tabs from:\nOptions -> Privacy -> Container Tabs", title: "Containers On The Go", iconUrl: "icons/icon-48.png" } );
				return;
			}
			var sContextArr = new Array();
			for( let iIdx = 0; iIdx < contexts.length; iIdx++ )
				if( contexts[ iIdx ].name.substr( 0, sNamePrefix.length ) == sNamePrefix )
					sContextArr.push( contexts[ iIdx ].name );
			for( var i = 0; i < sContextArr.length + 1; i++ )
				if( sContextArr.indexOf( sNamePrefix + ( i + 1 ) ) == -1 )
					break;
			var sColors = [ "red", "blue", "orange", "green", "pink", "turquoise", "purple", "yellow" ];
			browser.contextualIdentities.create( { name: sNamePrefix + ( i + 1 ), color: sColors[ i % sColors.length ], icon: "circle" } ).then(
				function( context ) {
					let params = {};
					if( !bIncognito )
						params.cookieStoreId = context.cookieStoreId;
					if( sUrl != "" )
						params.url = sUrl;
					browser.tabs.create( params );
				}
			);
		}
	);
}

function BrowserAction_OnClicked( tab ) {
	OpenNewTab( "", tab.incognito );
}

function  ContextMenus_OnClicked( info, tab ) {
	OpenNewTab( info.linkUrl, tab.incognito );
}

function Tabs_OnRemoved( tabId, removeInfo ) {
	browser.contextualIdentities.query( {} ).then(
		function( contexts ) {
			var sCogStoreIdArr = new Array();
			for( let iIdx = 0; iIdx < contexts.length; iIdx++ )
				if( contexts[ iIdx ].name.substr( 0,  sNamePrefix.length ) == sNamePrefix )
					sCogStoreIdArr.push( contexts[ iIdx ].cookieStoreId );
			browser.cookies.getAllCookieStores().then(
				function( cookieStores ) {
					for( let iIdx = 0; iIdx < cookieStores.length; iIdx++ ) {
						let iStoreIdx = sCogStoreIdArr.indexOf( cookieStores[ iIdx ].id );
						if( iStoreIdx != -1 && ( cookieStores[ iIdx ].tabIds.length != 1 || cookieStores[ iIdx ].tabIds[ 0 ] != tabId ) )
							sCogStoreIdArr.splice( iStoreIdx, 1 );
					}
					for( var i = 0; i < sCogStoreIdArr.length; i++ )
						browser.contextualIdentities.remove( sCogStoreIdArr[ i ] );
				}
			);
		}
	);
}

function ContextMenuSetup() {
	if( bOpenLinkMenuItem ) {
		browser.contextMenus.create( { title: "Open link in new container", contexts: [ "link" ] } );
		browser.contextMenus.onClicked.addListener( ContextMenus_OnClicked );
	} else {
		browser.contextMenus.removeAll();
		browser.contextMenus.onClicked.removeListener( ContextMenus_OnClicked );
	}
}
