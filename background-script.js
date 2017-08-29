var sNamePrefix = "CG ";

function OpenNewTab( sUrl ) {
	browser.contextualIdentities.query( {} ).then(
		function( contexts ) {
			if( contexts == false ) {
				browser.notifications.create( { type: "basic", message: "Please enable container tabs from:\nOptions -> Privacy -> Container Tabs", title: "Containers On The Go", iconUrl: "icons/icon-48.png" } );
				return;
			}
			var sContextArr = new Array();
			for( let context of contexts )
				if( context.name.substr( 0, sNamePrefix.length ) == sNamePrefix )
					sContextArr.push( context.name );
			for( var i = 0; i < sContextArr.length + 1; i++ )
				if( sContextArr.indexOf( sNamePrefix + ( i + 1 ) ) == -1 )
					break;
			var sColors = [ "red", "blue", "orange", "green", "pink", "turquoise", "purple", "yellow" ];
			browser.contextualIdentities.create( { name: sNamePrefix + ( i + 1 ), color: sColors[ i % sColors.length ], icon: "circle" } ).then(
				function( context ) {
  					browser.tabs.create( { cookieStoreId: context.cookieStoreId, url: sUrl } );
				}
			);
		}
	);
}

function handleBrowserAction() {
	OpenNewTab( "about:blank" );
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

var sOpenLinkMenuitem = "open_link_menuitem";
var sOpenLinkContextId = "containers-on-the-go-open-link";

function handleMessage( message, sender, sendResponse ) {
	if( message.type == "set_" + sOpenLinkMenuitem )
	{
		SetOption( sOpenLinkMenuitem, message.value );
		ContextMenuSetup( message.value );
	}
	else
	if( message.type == "get_" + sOpenLinkMenuitem )
	{
		GetOption( sOpenLinkMenuitem ).then(
			function( value ) { sendResponse( { [sOpenLinkMenuitem]: ( value[ sOpenLinkMenuitem ] != false ) } ); }
		);
		return true;
	}
}

function  handleContextMenuClick( info, tab ) {
	if( info.menuItemId == sOpenLinkContextId )
		OpenNewTab( info.linkUrl );
}

function ContextMenuSetup( enable ) {
	var sMenuItemId = sOpenLinkContextId;

	if( enable )
	{
		browser.contextMenus.create( { id: sMenuItemId, title: "Open link in new container", contexts: [ "link" ] } );
		browser.contextMenus.onClicked.addListener( handleContextMenuClick );
	}
	else
	{
		browser.contextMenus.remove( sMenuItemId );
		browser.contextMenus.onClicked.removeListener( handleContextMenuClick );
	}
}

function GetOption( option_name ) {
	return new Promise( 
		function( resolve, reject ) {
			browser.storage.local.get( option_name ).then(
				function( result ) { resolve( result ); }
			);
		}
	);
}

function SetOption( option_name, option_value ) {
	browser.storage.local.set( { [option_name]: option_value } );
}

browser.runtime.onMessage.addListener( handleMessage );
browser.tabs.onRemoved.addListener( handleRemoved );
browser.browserAction.onClicked.addListener( handleBrowserAction );

GetOption( sOpenLinkMenuitem ).then(
	function( value ) {
		ContextMenuSetup( value[ sOpenLinkMenuitem ] != false );
	}
);
