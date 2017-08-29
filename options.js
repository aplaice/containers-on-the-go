var sOpenLinkMenuitem = "open_link_menuitem";

document.addEventListener( "DOMContentLoaded",
	function() {
		browser.runtime.sendMessage( { type: "get_" + sOpenLinkMenuitem } ).then(
			function( message ) {
				document.getElementById( sOpenLinkMenuitem ).checked = message[ sOpenLinkMenuitem ];
			}
		);
	}
);

document.getElementById( sOpenLinkMenuitem ).addEventListener( "click",
	function( e ) {
		browser.runtime.sendMessage( { type: "set_" + sOpenLinkMenuitem, value: document.getElementById( sOpenLinkMenuitem ).checked } );
	}
);
