var selectionArray = [];
var removedCount = 0;
var mode = "";

$(function() {
	
	$("#nav-bar button").on("click", function() {
		$navItem = $(this);
		$("#nav-over").children("div").addClass("displayNone");
		$("#" + $navItem.attr("id") + "-over").removeClass("displayNone");
		$("#frameMain").addClass("frame-over");
		return false;
	});
	
	$("body").on("click", function() {
		$("#nav-over").children("div").addClass("displayNone");
	});
	
	$("#nav-bar-PACKAGES-PACKAGES-NEWTEMPLATE").on("click", function() {
		$("#frameMain").attr("src", "createpackage.html")
	});
	
	$("#nav-bar-PACKAGE-PACKAGE-SEARCH").on("click", function() {
		$("#frameMain").attr("src", "packagesearch.html")
	});
	
	$("#AddDocumentsLarge, #AddDocumentsButton").on("click", function() {
		$("#Modal, #attachDocs_panel").removeClass("displayNone");
		selectionArray = [];
		$("#docSearchResultsWrapper").addClass("displayNone");
		$("#documentSelectedSummary").html("0");
		$("#documentSearchResultTable").find("input[type='checkbox']").prop( "checked", false );
	});
	
	$("#btnattachDocs_panel_cancel, #closeBox").on("click" , function() {
		$("#Modal, #attachDocs_panel").addClass("displayNone");
	});
	
	$("#btnattachDocs_panel_ok").on("click" , function() {
		$("#Modal, #attachDocs_panel").addClass("displayNone");
		populateDocumentSearch();
	});
	
	$("#btnSearch_page").on("click", function() {
		$("#docSearchResultsWrapper").removeClass("displayNone");
		var itemsString = "";
	  	/*$.each( packagesJSON, function( key, val ) {
	    	itemsString += '<tr class="dataRow">'
			itemsString += '<td class="tight"><input type="checkbox" data-id="' + key +'"></td>'
			itemsString += '<td><div class="ficon" style="background-image:url(../images/icon_)">' + val.Properties.PackageNo.value +'</span></td>'
			itemsString += '<td><a href="packageProperties.html?id='+ key +'">' + val.Properties.Title.value +'</a></td>'
			itemsString += '<td><span>' + val.Properties.Revision.value +'</span></td>'
			itemsString += '<td><span>' + val.Properties.Status.value +'</span></td>'				
			itemsString += '<td><span>' + val.Properties.Type.value +'</span></td>'
			itemsString += '<td><span>' + val.Properties.Owners.value +'</span></td>'
			itemsString += '<td class="' + updatesAvailableClass + '"><span>' + val.UpdatesAvailable.value +'</span></td>'
			itemsString += '</tr>;'
	  	});
	  	$("#rowPerMailTableBody").html(itemsString);*/
	});
	
	$("#btnSavePackage").on("click" , function() {
		$("#Modal, #savePackagePanel").removeClass("displayNone");
		$("#confirm-lottitle").html($("#lotTitle input").val());
		$("#confirm-lotnumber").html($("#lotNumber input").val());
	});
	
	$("#ConfirmClose").on("click" , function() {
		//$("#Modal, #savePackagePanel").addClass("displayNone");
		document.location = "packagesearch.html";
		return false;		
	});
	
	$("#ButtonEditPackageHolder #btnSavePackage").on("click" , function() {
		//var mode = getParameterByName('mode');
		if(mode === "edit") {
			$("#Modal, #editSavePackagePanel").removeClass("displayNone");
			$("#confirm-lottitle").html($("#lotTitle input").val());
			$("#confirm-lotnumber").html($("#lotNumber input").val());			
		} else {
			//document.location = document.location + "&mode=edit";
			mode = "edit";
			packageProperties();
			$("#Modal, #editSavePackagePanel").addClass("displayNone");
		}
	});
	
	$("#EditPackageFromMessage").on("click" , function() {		
		//document.location = document.location + "&mode=edit";
		packageProperties();
		mode = "edit";			
	});
	
	$("#NextStepPackageRegister").on("click" , function() {
		document.location = "lotsearch.html";
	});
	
	$("#HistorySelectorHeader").on("click" , function() {
		if(!$(this).hasClass("nonselectable")) {
			$(this).next().toggleClass("displayNone");
		}
	});
	
	$("#ButtonCancelEditPackage").on("click" , function() {
		//var viewPath = document.location + "";
		//viewPath = viewPath.replace("&mode=edit", "");
		
		//document.location = viewPath;
		
		mode = "";
		packageProperties();
		return false;
	});
	
	$("#EditConfirmClose").on("click" , function() {
		//var viewPath = document.location + "";
		//viewPath = viewPath.replace("&mode=edit", "");
		//document.location = viewPath;
		
		mode = "";
		packageProperties();
		$("#Modal, #editSavePackagePanel").addClass("displayNone");
		return false;
	});
	
	$("#PackageUpdateDocuments").on("click" , "button", function() {
		var updateCount = 0;	
		$("#PackageDocumentsTable").find("tr").each(function(key,item) {
			var checkedBox = $(item).find("input[type='checkbox']:checked");
			var outofdatelabel = $(item).find("label.outofdate");
			if(checkedBox.length > 0 && outofdatelabel.length > 0) {
				outofdatelabel.each(function(key,item) {
					$(item).removeClass("outofdate").addClass("uptodate")
					$(item).parent().next().children("label.compareLabel").html($(item).html());
				});		
				updateCount++;
			}
			$(item).find("input[type='checkbox']").prop("checked", false);
			$("#selectedSummary").html("0");			
		});
		
		var updatesAvailableCount = parseInt($("#DocumentUpdatesAvailablePill").attr("data-updatecount")) - updateCount;
		if(updatesAvailableCount > 0) {
			$("#DocumentUpdatesAvailablePill").removeClass("uptodate").attr("data-updatecount" , updatesAvailableCount);
		} else {
			$("#DocumentUpdatesAvailablePill").addClass("uptodate").attr("data-updatecount", updatesAvailableCount);
			$("#DocumentUpdatesAvailableLabel").html("Up to date")
		}
		
		if(updateCount > 0) {
			growl("success" , "PackageDocuments", 8000, 1000, updateCount + " Documents updated successfully to the latest version in the Document Register <br /><br />As a next step, would you like to <a class='promptUpdateProperties'>update the properties of the Package</a>?");
		} else {
			growl("success" , "PackageDocuments", 8000, 1000, "All documents you've selected are already up to date <br /><br />As a next step, would you like to <a class='promptUpdateProperties'>update the properties of the Package</a>?");
		}
	});
	
	$('body').animate({ scrollTop: "300px" }, 1000);
			
	$("#PackageMenu").on("click", "div.propertiesLink", function() {
		var $menuItem = $(this);
		//$('#PackageInformationPanel').scrollTop(($("#" + $menuItem.attr("data-paneltodisplay")).offset().top - 50));
		$("#PackageInformationPanel").children("div").addClass("displayNone");
		$("#" + $menuItem.attr("data-paneltodisplay")).removeClass("displayNone");
		$("#PackageMenu").children("div").removeClass("active");
		$menuItem.addClass("active");
	});
	
	$("#PackageDocuments").on("click", "a.promptUpdateProperties", function() {
		$("#ViewPackageProperties").trigger("click");
	});
		
	$("#PackageDocumentsTable").on("click" , "input[type='checkbox']", function() {
		var selectedDocsCount = $("#PackageDocumentsTable input[type='checkbox']:checked").length;
		if(selectedDocsCount > 0) {
			$("#PackageTools .btn").removeAttr("disabled");
			$("#PackageUpdateDocuments .btn").removeAttr("disabled");
			$("#PackageShowInDocumentRegister .btn").removeAttr("disabled");
		} else {
			$("#PackageTools .btn").prop("disabled", true);
			$("#PackageUpdateDocuments .btn").prop("disabled", true);
			$("#PackageShowInDocumentRegister .btn").prop("disabled", true);
		}
		$("#selectedSummary").html(selectedDocsCount);
	});
	
	$("#PackageMailTable").on("click" , "input[type='checkbox']", function() {
		var selectedMailCount = $("#PackageMailTable input[type='checkbox']:checked").length;
		if(selectedMailCount > 0) {
			$("#CloseOutMail .btn").removeAttr("disabled");
		} else {
			$("#CloseOutMail .btn").prop("disabled", true);
		}
		$("#MailSelectedSummary").html(selectedMailCount);
	});
	
	$("#CreateNewMail").on("click", function() {
		$("#CreateMailPanel").removeClass("displayNone");
		//$("#Correspondence_correspondenceTypeID option[name='" + $(this).attr("data-mailtype") + "']").attr("selected", "selected");
	});
	
	$("#SendMail").on("click", function() {
		$("#CreateMailPanel").addClass("displayNone");
		var mailDate = new Date(Date.now());
		var mailDateString = mailDate.getDate() + "/" + (mailDate.getMonth() + 1) + "/" + mailDate.getFullYear();
		var mailString;
		mailString += "<tr class='dataRow'>";
  		mailString += "<td class='dataOptionsIndicator selectorCell'><input type='checkbox' name='selectedIdsInPage' value='" + "MAJ-RRR-0000011" + "' onclick='' /></td>";
  		mailString += "<td class='mailStatus-indicator mailStatus-notApplicableStatus'>N/A</td>";
  		mailString += "<td class=''>" + "" + "</td>";
  		mailString += "<td class=''>" + "MAJ-RRR-0000011" + "</td>";
  		mailString += "<td>" + $("#Correspondence_subject").val() + "</td>";
  		mailString += "<td>" + mailDateString + "</td>";
  		mailString += "<td>Patrick Leary</td>";
  		mailString += "<td>Aconex</td>";
  		mailString += "<td>Jeremy Irons</td>";
  		mailString += "<td>" + $("#Correspondence_correspondenceTypeID option[selected='selected']").text() + "</td>";
  		mailString += "</tr>";
		$("#PackageMailTable tbody").prepend(mailString);
		
		var mailCount = $("#PackageMailTable tbody tr").length;
		$("#mailCount, #MailTotalPill").html(mailCount);
		
		$("#Correspondence_subject").val("");
		$("#Correspondence_correspondenceTypeID option[selected='selected']").removeAttr("selected");
		
	});
	
	$("#selectMenu").on("click" , function() {
		var $selectMenu = $(this);
		if($selectMenu.attr("data-checked") === "false") {
			$("#PackageDocumentsTable input[type='checkbox']:not(:checked)").each(function(key,item) {
				$(item).prop("checked", false).trigger("click");
			});
			$("#PackageTools .btn").removeAttr("disabled");
			$("#PackageUpdateDocuments .btn").removeAttr("disabled");
			$("#PackageShowInDocumentRegister .btn").removeAttr("disabled");
			$selectMenu.attr("data-checked", "true");
		} else {
			$("#PackageDocumentsTable input[type='checkbox']").each(function(key,item) {
				$(item).prop("checked", true).trigger("click");
			});
			$("#PackageTools .btn").prop("disabled", true);
			$("#PackageUpdateDocuments .btn").prop("disabled", true);
			$("#PackageShowInDocumentRegister .btn").prop("disabled", true);
			$selectMenu.attr("data-checked", "false");
		}	
	});
	
	$("#SelectAllMail").on("click" , function() {
		var $selectMenu = $(this);
		if($selectMenu.attr("data-checked") === "false") {
			$("#PackageMailTable input[type='checkbox']:not(:checked)").each(function(key,item) {
				$(item).prop("checked", false).trigger("click");
			});
			$("#CloseOutMail .btn").removeAttr("disabled");
			$selectMenu.attr("data-checked", "true");
		} else {
			$("#PackageMailTable input[type='checkbox']").each(function(key,item) {
				$(item).prop("checked", true).trigger("click");
			});
			$("#CloseOutMail .btn").prop("disabled", true);
			$selectMenu.attr("data-checked", "false");
		}	
	});

	$("div.dropdown-btn").on("click" , function() {
		var $dropDownButton = $(this);
		if(!$dropDownButton.find("button").prop("disabled")) {
			if($dropDownButton.prop("disabled") !== "true") {
				$dropDownButton.toggleClass("active");
			}	
		}
	});
	
	$("#resultTable").on("click", "div.removeButton", function() {
		removedCount++;
		$(this).parent().parent().remove();
		$("#numResults").html("<b>" + (selectionArray.length - removedCount) + "</b> documents&nbsp;&nbsp;(<b><span id='selectedSummary'>0</span></b> selected)");
	});
	
	$("#RemoveSelectedDocuments").on("click" , function() {
		var $selectedToRemove = $("#PackageDocumentsTable input[type='checkbox']:checked");
		$selectedToRemove.each(function(key,item) {
			$(item).parent().parent().remove();
		});
		var docCount = $("#PackageDocumentsTable tr").length - 2;
		$("#documentCount").html("<b>" + docCount + "</b>");
		$("#selectedSummary").html("0");
		$("#DocumentsTotalPill").html(docCount);
		$("#PackageTools .btn").prop("disabled", true)
		$("#PackageTools").removeClass("active");
		$("#PackageUpdateDocuments .btn").prop("disabled", true);
		growl("success" , "PackageDocuments", 4000, 1000, $selectedToRemove.length + " Documents removed successfully from the package");
	});
	
	$("#documentSearchResultTable td.tight > input[type='checkbox']").on("click" , function() {
		$selectedBox = $(this);
		if($selectedBox.is(':checked')) {
			selectionArray.push($selectedBox.parent().parent()[0].outerHTML);
		    //selectionArray.push($selectedBox.parent().parent().attr("data-uimenu-props-json")); 
		} else {		
			for(var i =0; i<selectionArray.length; i++) {
					if(selectionArray[i].indexOf("'documentId':'" + $selectedBox.val() + "'") !== -1) {
					selectionArray.splice(i,1);
				}
			}
		}
		$("#documentSelectedSummary").html(selectionArray.length);
	});
	
	$('#selectOwners').selectize({
		plugins: ['remove_button', 'selectable_placeholder'],
		options: [{"name":"Patrick Leary"},{"name":"Rita Waller"},{"name":"Snow Pittman"},{"name":"June Mendoza"},{"name":"Mcmillan Harper"},{"name":"Lucy Maddox"},{"name":"Arnold Cohen"},{"name":"Beach Ruiz"},{"name":"Dianna Wright"},{"name":"Wilcox Murphy"},{"name":"Mia Gray"},{"name":"Deena Madden"},{"name":"Curry Collins"},{"name":"Newman Vargas"},{"name":"Desiree Lowery"},{"name":"Neva Landry"},{"name":"Nanette Stevenson"},{"name":"Myers Tanner"},{"name":"Hobbs Vaughn"},{"name":"Lucile Avila"},{"name":"Beard Anderson"},{"name":"Langley Vincent"},{"name":"Marla Cervantes"},{"name":"Harper Wong"},{"name":"Greer Santana"},{"name":"Crystal Berg"},{"name":"Stacie Boone"},{"name":"Albert Bond"},{"name":"Noel Crawford"},{"name":"Fran Carlson"},{"name":"Whitney Webster"},{"name":"Buchanan Morin"},{"name":"Savannah Robles"},{"name":"Ryan Jensen"},{"name":"Jayne Petty"},{"name":"Villarreal Calderon"},{"name":"Stark Valdez"},{"name":"Enid Aguirre"},{"name":"Tucker Lloyd"},{"name":"Fowler Hardy"},{"name":"Bentley Alexander"},{"name":"Claudia Pacheco"},{"name":"Clarke Russell"},{"name":"Effie Valenzuela"},{"name":"Nicole Hodge"},{"name":"Lacey Atkins"},{"name":"Davis Ramos"},{"name":"Margie Spence"},{"name":"Gallagher Gibbs"},{"name":"Lolita Workman"},{"name":"Strong Sloan"},{"name":"Branch Cain"},{"name":"Rhoda Solomon"},{"name":"Amalia Mckee"},{"name":"Vinson Erickson"},{"name":"Skinner Rich"},{"name":"Ilene Osborne"},{"name":"Clark Reilly"},{"name":"Cabrera York"},{"name":"Heath Morales"},{"name":"Bender Pierce"},{"name":"Leta Lee"},{"name":"Gail May"},{"name":"Jessie Velez"},{"name":"Gates Henderson"},{"name":"Kasey Golden"},{"name":"Allison Downs"},{"name":"Valarie Frost"},{"name":"Merritt Nielsen"},{"name":"Norman Nixon"},{"name":"Goff Skinner"},{"name":"Craft Wallace"},{"name":"Willa Preston"},{"name":"Kim Merritt"},{"name":"Chang Roberson"},{"name":"Evangeline Schultz"},{"name":"Margaret Conrad"},{"name":"Hoover Paul"},{"name":"Darla Bradford"},{"name":"Jillian Head"},{"name":"Santos Salazar"},{"name":"Debbie Leonard"},{"name":"Sampson Bryan"},{"name":"Nelda Rivas"},{"name":"Corinne Bailey"},{"name":"Jessica Alvarado"},{"name":"Lea Cotton"},{"name":"Wilda Lane"},{"name":"Byers Hernandez"},{"name":"Aimee Atkinson"},{"name":"Walters Craig"},{"name":"Erika Mcdonald"},{"name":"Kent Woodard"},{"name":"Shauna Dodson"},{"name":"Bradford Bullock"},{"name":"Wynn Santiago"},{"name":"Aileen Rosario"},{"name":"Lorie Perkins"},{"name":"Katelyn Sparks"},{"name":"Perez Moody"},{"name":"Rodgers Villarreal"},{"name":"Margarita Jordan"},{"name":"Frederick Shepherd"},{"name":"Padilla Watson"},{"name":"Marcia Garrison"},{"name":"Leonor Estrada"},{"name":"Katherine Camacho"},{"name":"Lewis Wood"},{"name":"Rivera Barr"},{"name":"Dena Conner"},{"name":"Cruz Hopper"},{"name":"Ortega Prince"},{"name":"Ratliff Myers"},{"name":"Fay Foster"},{"name":"Booker Matthews"},{"name":"Little Whitaker"},{"name":"Burris Freeman"},{"name":"Chris Munoz"},{"name":"Wiley Rogers"},{"name":"Louella Kidd"},{"name":"Charlene Joyner"},{"name":"Farley Sanders"},{"name":"Lorraine Kim"},{"name":"Cecilia Holder"},{"name":"Rios Saunders"},{"name":"Floyd Blevins"},{"name":"Sadie Morgan"},{"name":"Colon Graham"},{"name":"Diane Frank"},{"name":"Sherry Rose"},{"name":"Aurora Bean"},{"name":"Reba Ray"},{"name":"Christian Medina"},{"name":"Leslie Taylor"},{"name":"Bishop Humphrey"},{"name":"Morris Shannon"},{"name":"Katrina Callahan"},{"name":"Haynes Greer"},{"name":"Roth Rivera"},{"name":"Haley Benson"},{"name":"Priscilla Cortez"},{"name":"Henson Lara"},{"name":"Latoya Scott"},{"name":"Adriana Espinoza"},{"name":"Webster Potts"},{"name":"Carey Wilson"},{"name":"Elma Norris"},{"name":"Wong Gay"},{"name":"Love Castillo"},{"name":"Gross Cantrell"},{"name":"Vincent Mcfarland"},{"name":"Bernard Coffey"},{"name":"Jeri Brock"},{"name":"Hinton Sullivan"},{"name":"Randall Conley"},{"name":"Hamilton Pugh"},{"name":"Nichols White"},{"name":"Lorrie Butler"},{"name":"Robertson James"},{"name":"Ramsey Blair"},{"name":"Suzette Gates"},{"name":"Joyce Owen"},{"name":"Kirsten Little"},{"name":"Amelia Booth"},{"name":"Sherman Park"},{"name":"Bowman Velasquez"},{"name":"Matilda Mcconnell"},{"name":"Jolene Blackwell"},{"name":"Jane Hickman"},{"name":"Ericka Forbes"},{"name":"Maggie Vazquez"},{"name":"Sherrie Moss"},{"name":"Wilson Hess"},{"name":"Harris Montoya"},{"name":"Maxine Mann"},{"name":"Wanda Decker"},{"name":"Wilma Reid"},{"name":"Marcy Harrington"},{"name":"Kendra Irwin"},{"name":"Gilda Dudley"},{"name":"Kathryn Mclean"},{"name":"Ada Buck"},{"name":"Crosby Ortega"},{"name":"Walker Davis"},{"name":"Travis Barton"},{"name":"Luisa Baxter"},{"name":"Madden Cardenas"},{"name":"Harriet Ewing"},{"name":"Deborah Calhoun"},{"name":"Ines Hawkins"},{"name":"Steele Carney"},{"name":"Valerie Page"},{"name":"Socorro Kane"},{"name":"Beasley Dalton"},{"name":"Jeanie Barber"},{"name":"Luella Sutton"},{"name":"Frazier Whitehead"},{"name":"Mckenzie Schmidt"},{"name":"Lauri Rosales"},{"name":"Bianca Gallagher"},{"name":"Bridget Powers"},{"name":"Kitty Eaton"},{"name":"Rogers Harmon"},{"name":"Francesca Fuller"},{"name":"Quinn Tillman"},{"name":"Walter Mayo"},{"name":"Amanda Patel"},{"name":"Ellis Leon"},{"name":"Lynette Hester"},{"name":"Anthony Morrison"},{"name":"Lucille Carver"},{"name":"Katie Phillips"},{"name":"Saundra Hewitt"},{"name":"Wendi Roman"},{"name":"Lenora Moon"},{"name":"Burnett Blake"},{"name":"Russo Holcomb"},{"name":"Queen Murray"},{"name":"Petty Barrera"},{"name":"Jarvis Holland"},{"name":"Waters Quinn"},{"name":"Schroeder Dominguez"},{"name":"Herminia Harrell"},{"name":"Murphy Gentry"},{"name":"Long Hurst"},{"name":"Johanna Lawrence"},{"name":"Toni Mcguire"},{"name":"Colleen Cox"},{"name":"Mcclure Bowman"},{"name":"Aguirre Woodward"},{"name":"Wilkerson Oneill"},{"name":"Alicia Robbins"},{"name":"Kristie Orr"},{"name":"Hopkins Day"},{"name":"Noelle Bruce"},{"name":"Rowe Miranda"},{"name":"Pauline Riley"},{"name":"Hull Kaufman"},{"name":"Laurie Kemp"},{"name":"Jeanine Hicks"},{"name":"Harriett Hahn"},{"name":"Welch Knowles"},{"name":"Abby Acosta"},{"name":"Castaneda Stone"},{"name":"Guadalupe Ferguson"},{"name":"Geraldine Roberts"},{"name":"Lina Boyle"},{"name":"Stephenson Cooke"},{"name":"Thomas Whitfield"},{"name":"Luz Ellis"},{"name":"Ola Rosa"},{"name":"Casey Pruitt"},{"name":"Amie Morse"},{"name":"Garrison Mcgowan"},{"name":"Stewart Langley"}],
	    maxItems: null,
	    valueField: 'name',
	    labelField: 'name',
	    searchField: ['name'],
	    openOnFocus: false,
	    closeAfterSelect: true,
	    render: {
	        item: function(item, escape) {
	            return '<div>' +
	                (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
	            '</div>';
	        },
	        option: function(item, escape) {
	            var label = item.name;
	            return '<div>' +
	                '<span class="label">' + escape(label) + '</span>' +
	            '</div>';
	        }
	    }/*,
	    onInitialize: function() {
		    $('#PackageFieldCollection').find(".selectize-input").prepend("<div data-value='Patrick Leary' class=''><span class='name'>Patrick Leary</span></div>");
	    },
	    onItemAdd(value, $item) {
		    $('#PackageFieldCollection').find("div[data-value='Patrick Leary']").remove();
		    $('#PackageFieldCollection').find(".selectize-input").prepend("<div data-value='Silas Haysom' class=''><span class='name'>Patrick Leary</span></div>");
	    }*/
	});
	
	$("ul.nav-tabs").on("click", "a", function() {
		var $tab = $(this);
		var tabBinding = $tab.attr("data-tabbinding");
		var $tabContent = $tab.closest("ul.nav-tabs").next();
		$tabContent.find("section").each(function (key,item) {
			$(item).attr("id") === tabBinding ? $(item).removeClass("displayNone") : $(item).addClass("displayNone");
		});
		$tab.closest("ul.nav-tabs").find("li").each(function (key,item) {
			$(item).children("a").attr("data-tabbinding") === tabBinding ? $(item).addClass("active") : $(item).removeClass("active");
		});
	});

});

function populateDocumentSearch() {
	if(selectionArray.length > 0) {
		$("#loadingMessage").addClass("displayNone");
		$("#searchResultsContainer").removeClass("displayNone");
		$("#numResults").html("<b>" + selectionArray.length + "</b> documents&nbsp;&nbsp;(<b><span id='selectedSummary'>0</span></b> selected)");
		for(var i = 0; i<selectionArray.length; i++) {
			$("#resultTable tbody").append(selectionArray[i]);
		}
		$("#resultTable").find(".removeColumn").removeClass("displayNone");
	}
}

function packageSearch() {

	  	var itemsString = "";
	  	$.each( packagesJSON, function( key, val ) {
		  	var updatesAvailableClass = val.UpdatesAvailable.updateCount > 0 ? "package-updates-available" : "package-updates-notavailable";
	    	itemsString += '<tr class="dataRow ng-scope">';
			itemsString += '<td class="column_packageNo"><span>' + val.Properties.PackageNo.value +'</span></td>';
			itemsString += '<td><a href="packageProperties.html?id='+ key +'">' + val.Properties.Title.value +'</a></td>';
			itemsString += '<td><span>' + val.Properties.Revision.value +'</span></td>';
			itemsString += '<td><span>' + val.Properties.Status.value +'</span></td>';			
			itemsString += '<td><span>' + val.Properties.Type.value +'</span></td>';
			itemsString += '<td><span>' + val.Properties.Owners.value +'</span></td>';
			itemsString += '<td class="' + updatesAvailableClass + '"><span>' + val.UpdatesAvailable.value +'</span></td>';
			itemsString += '</tr>';
	  	});
	  	$("#rowPerMailTableBody").html(itemsString);
	  	$("#packageResultSummary").html("1 - " + packagesJSON.length + " of " + packagesJSON.length);

}

function packageProperties() {
	var packageID = getParameterByName('id');
	//var mode = getParameterByName('mode');
	var data = packagesJSON;
		var menuString = "";
	  	var propertiesString = "";
	  	var documentsString = "";
	  	var recordsString = "";
	  	var mailString = "";
	  	var packageData = data[packageID];
	  	var iconPackageDocuments = "<svg width='17px' height='19px' viewBox='0 0 17 19'><g stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'><g id='ICONS' fill='#B9B9B7'><g id='Docs-Icon---Unselected'><path d='M12,16 L12,19 L0,19 L0,4 L4,4 L4,16 L12,16 Z' id='Docs-Icon'></path><path d='M5,15 L17,15 L17,5 L12.0169525,5 L12,0 L5,0 L5,15 Z M13,0 L17,4 L13,4 L13,0 Z' id='Docs-Icon'></path></g></g></g></svg>"
	  	var iconPackageProperties = "<svg width='19px' height='18px' viewBox='0 0 19 18'><g stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'> <g id='ICONS' transform='translate(0.000000, -60.000000)' fill='#B9B9B7'> <g id='Properties-Icon---Unselected' transform='translate(0.000000, 60.000000)'> <path d='M0,0 L19,0 L19,18 L0,18 L0,0 Z M2,2 L4,2 L4,4 L2,4 L2,2 Z M6,2 L17,2 L17,4 L6,4 L6,2 Z M2,6 L4,6 L4,8 L2,8 L2,6 Z M6,6 L17,6 L17,8 L6,8 L6,6 Z M2,10 L4,10 L4,12 L2,12 L2,10 Z M6,10 L17,10 L17,12 L6,12 L6,10 Z M2,14 L4,14 L4,16 L2,16 L2,14 Z M6,14 L17,14 L17,16 L6,16 L6,14 Z' id='Combined-Shape'></path></g></g></g></svg>"
	  	
	  	$("#PackageNo-Title").html(packageData.Properties.PackageNo.value);
	  	$("#PackageTitle-Title").html(packageData.Properties.Title.value);
	  	$("#HistoryVer").html("Rev: " + packageData.Properties.Revision.value);
	  	$("#HistoryNote").html(packageData.Properties.Note.value);
	  	//$("#HistoryRev").html("#" + packageData.Properties.Version.value);
	  	$("#Status-Title").html(packageData.Properties.Status.value);
	  	$("#RevDate-Title").html(packageData.Properties.RevisionDate.value);
	  	
	  	/* EDIT MODE CHANGES */
	  	if(mode === "edit") {
		  	$("#btnSavePackage").find("div.uiButton-label").html("Save");
		  	$("#PackagePropertiesHeader").html("Edit Package");
		  	$("#HistorySelectorHeader").addClass("nonselectable");
		  	$("#ViewPackage").addClass("editMode");
	  	} else {
		  	$("#btnSavePackage").find("div.uiButton-label").html("Edit");
		  	$("#PackagePropertiesHeader").html("Package Details");
		  	$("#HistorySelectorHeader").removeClass("nonselectable");
		  	$("#ViewPackage").removeClass("editMode");
	  	}
	  	
	  	if($("#PackageMenu").children("div").length === 0) {
		  	menuString += "<div id='ViewPackageProperties' data-selectedtabid='ViewPackageProperties' data-paneltodisplay='PackageProps' class='clearFloats propertiesLink active'><div class='propertiesLabel'>" + iconPackageProperties + "<label>Properties</label></div></div>";	  	
		  	if(packageData.Properties.Type.value === "Construction Lot") {
			  	menuString += "<div id='ViewPackageRecords' data-selectedtabid='ViewPackageRecords' data-paneltodisplay='PackageRecords' class='clearFloats propertiesLink'><div class='propertiesLabel'><label>Records</label></div><div class='propertiesValue'><div class='pill' id='RecordsTotalPill'>" + Object.keys(packageData.Records).length + "</div></div></div>";
			  	menuString += "<div id='ViewPackageMail' data-selectedtabid='ViewPackageMail' data-paneltodisplay='PackageMail' class='clearFloats propertiesLink'><div class='propertiesLabel'><label>Mail</label></div><div class='propertiesValue'><div class='pill' id='MailTotalPill'>" + Object.keys(packageData.Mail).length + "</div></div></div>";
		  	}  	
		  	menuString += "<div id='ViewPackageDocuments' data-selectedtabid='ViewPackageDocuments' data-paneltodisplay='PackageDocuments' class='clearFloats propertiesLink'><div class='propertiesLabel'>" + iconPackageDocuments + "<label>Documents</label></div><div class='propertiesValue'><div class='pill' id='DocumentsTotalPill'>" + Object.keys(packageData.Documents).length + "</div> &nbsp; <div class='pill highlighted " + packageData.UpdatesAvailable.pillClass + "' id='DocumentUpdatesAvailablePill' data-updatecount='" + packageData.UpdatesAvailable.updateCount + "'>!</div> <label id='DocumentUpdatesAvailableLabel'>" + packageData.UpdatesAvailable.value + "</label></div></div>";	  	
		  	$("#PackageMenu").html(menuString);
	  	}
	  		  	
	  	var recordCount = 0;
	  	if(typeof packageData.Records[0] !== "undefined") {
		  	$("#RecordsHeader").removeClass("displayNone");
		  	for(var key in packageData.Records) {
		  		recordsString += "<div class='record-item'><input type='checkbox' class='displayNone'><div class='filetype-icon'></div><div class='record-item-details'><a>" + packageData.Records[key].FileName + "</a>" + packageData.Records[key].CreatedBy + ", " + packageData.Records[key].CreatedDate + "</div></div>";
		  		recordCount ++;
			}
	  	} else {
		  	recordsString = "<div class='no-items-message'>This Package doesn't contain any records</div>";
	  	}

		$("#RecordsList").html(recordsString);
		recordCount > 0 && ($("#RecordsNumResults").html("<b>" + recordCount + "</b> records"));
	  	if(mode === "edit") {
		  	$("#RemoveRecords").removeClass("displayNone");
		  	$("#RecordsList").find("input[type='checkbox']").removeClass("displayNone");
		  	$("#RecordsSelected").removeClass("displayNone");
		} else {
			$("#RemoveRecords").addClass("displayNone");
			$("#RecordsList").find("input[type='checkbox']").addClass("displayNone");
			$("#RecordsSelected").addClass("displayNone");
		}
		
		$("#mailCount").html(Object.keys(packageData.Mail).length);
		if(Object.keys(packageData.Mail).length > 0) {
		  	for(var key in packageData.Mail) {
		  		mailString += "<tr class='dataRow'>";
		  		mailString += "<td class='dataOptionsIndicator selectorCell'><input type='checkbox' name='selectedIdsInPage' value='" + packageData.Mail[key].MailNo + "' onclick='' /></td>";
		  		mailString += "<td class='mailStatus-indicator " + packageData.Mail[key].StatusClass + "'>" + packageData.Mail[key].Status + "</td>";
		  		mailString += "<td class=''>" + "" + "</td>";
		  		mailString += "<td class=''>" + packageData.Mail[key].MailNo + "</td>";
		  		mailString += "<td>" + packageData.Mail[key].Subject + "</td>";
		  		mailString += "<td>" + packageData.Mail[key].CreatedDate + "</td>";
		  		mailString += "<td>" + packageData.Mail[key].From + "</td>";
		  		mailString += "<td>" + packageData.Mail[key].FromOrg + "</td>";
		  		mailString += "<td>" + packageData.Mail[key].Recipients + "</td>";
		  		mailString += "<td>" + packageData.Mail[key].Type + "</td>";
		  		mailString += "</tr>";
			}
	  	} else {
		  	mailString = "<tr><td colspan='10'><div class='no-items-message'>This Package doesn't contain any mail</div></td></tr>";
	  	}	  	
		$("#PackageMailTable tbody").html(mailString);
	  	
	  	for(var key in packageData.Properties) {
		  	if(packageData.Properties[key].label !== "Note") {
			  	propertiesString += "<div class='clearFloats overflowAuto' id='Property_" + key + "'>"
			  	propertiesString += "<div class='propertiesLabel'><label>" + packageData.Properties[key].label + "</label></div>";
			  	propertiesString += "<div class='propertiesValue'><label class='" + packageData.Properties[key].labelClass + "'>" + packageData.Properties[key].value + "</label>" + packageData.Properties[key].editInputString + "</div>";
			  	propertiesString += "</div>";
		  	}		  	
	  	}
	  	$("#PackagePropertiesCollection").html(propertiesString);
	  	var documentCount = 0;
	  	var hasUpdates = packageData.UpdatesAvailable.updateCount > 0 ? true : false;
	  	if(hasUpdates && mode !== "edit") {
		  	$("#PackageUpdatesAvailable").removeClass("displayNone").children("span").html("This package contains documents within it that are at older versions than in the doc register. <strong class='edit-package-from-message'><a id='EditPackageFromMessage'>Edit the package</a></strong> to update them.</span>");
	  	}
	  	
	  	for(var key in packageData.Documents) {
		  	var revOutOfDateString = packageData.Documents[key].RevOutOfDate ? "outofdate' title='Update available'" : "' title='Up to date'";
		  	var verOutOfDateString = packageData.Documents[key].VerOutOfDate ? "outofdate' title='Update available'" : "' title='Up to date'";
		  	//var linkString = packageData.Documents[key].RelatedItemsChanges ? "<img src='../images/icon_link_changed.png' width='16' height='16' alt='' /> &nbsp; " + packageData.Documents[key].RelatedItemsCount : "<img src='../images/icon_link.png' width='16' height='16' alt='' /> &nbsp; " + packageData.Documents[key].RelatedItemsCount;
		  	documentCount++;
		  	documentsString += "<tr class='dataRow'>"
			documentsString += "<td class='tight dataOptionsIndicator selectorCell'><input type='checkbox' name='selectedIdsInPage' value='" + packageData.Documents[key].DocumentNo + "' onclick=''></td>";
			documentsString += "<td><div class='ficon' style='background-image: url(../images/icon_" + packageData.Documents[key].FileType + ".gif); margin: -2px 0;' onclick='' title='Open File'></div></td>";
			documentsString += "<td><div class='searchResults-cellWrap'>" + packageData.Documents[key].DocumentNo + "</div></td>";
			documentsString += "<td><a onclick='' href=''>" + packageData.Documents[key].Title + "</a></td>";
			documentsString += "<td class='columnComparison columnComparisonDoc'><label class='compareLabel " + revOutOfDateString + ">" + packageData.Documents[key].RegisterRev + "</label></td><td class='columnComparison'><label class='compareLabel'>" + packageData.Documents[key].PackageRev + "</label> &nbsp; <label class='updateDoc'>Update <span class='caret'></span></label></td>";
			documentsString += "<td class='columnComparison columnComparisonDoc'><label class='compareLabel " + verOutOfDateString + ">" + packageData.Documents[key].RegisterVer + "</label></td><td class='columnComparison'><label class='compareLabel'>" + packageData.Documents[key].PackageVer + "</label> &nbsp; <label class='updateDoc'>Update <span class='caret'></span></label></td>";
			//documentsString += "<td>" + linkString + "</td>";
			documentsString += "<td>" + packageData.Documents[key].Status + "</td>";
			documentsString += "<td>" + packageData.Documents[key].Type + "</td>";
			documentsString += "</tr>";
	  	}
	  	$("#documentCount").html("<b>" + documentCount + "</b>");
	  	$("#PackageDocumentsTable tbody").html(documentsString);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function growl(type, parentElement, duration, speed, messageText) {
	$("#" + parentElement).prepend("<ul class='messagePanel'><li class='message " + type + "'><div><div>" + messageText + "</div></div><div class='close'></div></li></ul>");
	setTimeout(function() {
		$("ul.messagePanel").fadeTo(speed, 0, function() {
			$(this).remove();
		});
	}, duration);
}

