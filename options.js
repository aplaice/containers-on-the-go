var openLinkMenuItem = document.getElementById( "openLinkMenuItem" );

openLinkMenuItem.onclick = function() {
	browser.runtime.sendMessage( { type: "set_settings", 
		"bOpenLinkMenuItem": openLinkMenuItem.checked
	} );
};
browser.runtime.sendMessage( { type: "get_settings" } ).then( function( settings ) {
	openLinkMenuItem.checked = settings[ "bOpenLinkMenuItem" ];
} );
