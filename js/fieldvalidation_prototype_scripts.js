
$(function() {
	
	
/* 
	========== YES/NO ALT ========== 
*/	

	$(".radio-group .radio").on("mousedown" , function() {
		var $radio = $(this);
		if($radio.find("input[type='radio']").prop("checked")) {
			$radio.attr("data-ischecked" , true);
		} else {
			$radio.attr("data-ischecked" , false);
		}
	});
	
	$(".radio-group .radio").on("click" , function() {
		var $radio = $(this);
		var $radioGroup = $(this).parent().parent();
		if(!$radioGroup.hasClass("mandatory")) {
			$radio.parent().children(".radio").removeClass("checked");
			if($radio.attr("data-ischecked") === "true") {
				$radio.removeClass("checked").find("input[type='radio']").prop("checked" , false);
			} else {
				$radio.removeClass("checked").find("input[type='radio']").prop("checked" , true);
				$radio.addClass("checked");
			}
		} else {
			$radio.parent().children(".radio").removeClass("checked").find("input[type='radio']").prop("checked" , false);
			$radio.addClass("checked").find("input[type='radio']").prop("checked" , true);
		}
	});
	
	$("a.group-clear").on("click" , function() {
		var $groupClear = $(this);
		$groupClear.parent().find(".radio").removeClass("checked").find("input[type='radio']").prop("checked" , false);;
	});
	
	
/* 
	========== DATE FIELD ========== 
*/
	
	$("#DateField input").on("blur" , function() {
		var isValid = true;
		var $dateField = $(this);
		var fieldMessage = "DD/MM/YYYY";

			if(checkValidDate($dateField.val()) !== null || $dateField.val().length === 0) {
			} else {
				isValid = false;
				fieldMessage = "Enter a date in the format: DD/MM/YYYY";
			}
			
			if(isValid) {
				$dateField.parent().removeClass("invalid").next().removeClass("error").html(fieldMessage);			
			} else {
				$dateField.parent().addClass("invalid").next().addClass("error").html(fieldMessage);
			}
	});
	
	$("#DateField input").on("keyup" , function() {
		var isValid = true;
		var $dateField = $(this);
		var fieldMessage = "DD/MM/YYYY";
		if($dateField.parent().attr("data-interacted") !== "true") {
			$dateField.parent().attr("data-interacted" , "true");
		} else {
			if($dateField.parent().hasClass("invalid")) {
				if(checkValidDate($dateField.val()) !== null || $dateField.val().length === 0) {
				} else {
					isValid = false;
				}
				
				if(isValid) {
					$dateField.parent().removeClass("invalid").next().removeClass("error").html(fieldMessage);			
				} else {
					$dateField.parent().addClass("invalid").next().addClass("error");
				}
			}
		}		
	});
	
/* 
	========== DATE FIELD (MANDATORY) ========== 
*/	
	
	$("#DateFieldMandatory input").on("blur" , function() {
		var isValid = true;
		var $dateField = $(this);
		var fieldMessage = "DD/MM/YYYY";
		if($dateField.parent().attr("data-interacted") === "true") {
			if($dateField.val().length < 1) {
				isValid = false;
				fieldMessage = "Enter an Estimated start date";
			} else {
				if(checkValidDate($dateField.val()) !== null) {
				} else {
					isValid = false;
					fieldMessage = "Enter a date in the format: DD/MM/YYYY";
				}
			}
			if(isValid) {
				$dateField.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);			
			} else {
				$dateField.parent().addClass("invalid").next().addClass("error").text(fieldMessage);
			}
		}
	});
	
	$("#DateFieldMandatory input").on("keyup" , function() {
		var isValid = true;
		var $dateField = $(this);
		var fieldMessage = "DD/MM/YYYY";
		if($dateField.parent().attr("data-interacted") !== "true") {
			$dateField.parent().attr("data-interacted" , "true");
		} else {
			if($dateField.parent().hasClass("invalid")) {
				if($dateField.val().length < 1) {
					isValid = false;
				} else {
					if(checkValidDate($dateField.val()) !== null) {
					} else {
						isValid = false;
					}
				}
				if(isValid) {
					$dateField.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);			
				} else {
					$dateField.parent().addClass("invalid").next().addClass("error");
				}
			}
		}
	});
	
/* 
	========== TEXT ========== 
*/
	
	$("#Text input").on("blur" , function() {
		var isValid = true;
		var $textField = $(this);
		var fieldMessage = "Between 5 and 10 characters";
		var minLength = 5;
		var maxLength = 10;
		
		if(checkValidText($textField.val()) === null) {
			if($textField.val().length !== 0) {
				isValid = false;
				$textField.val().length < minLength && (fieldMessage = "Enter at least " + minLength + " characters");
				$textField.val().length > maxLength && (fieldMessage = "Enter no more than " + maxLength + " characters");
			}
		}
		
		if(isValid) {
			$textField.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);			
		} else {
			$textField.parent().addClass("invalid").next().addClass("error").text(fieldMessage);
		}
	});
	
	$("#Text input").on("focus" , function() {
		var $textField = $(this);
		$textField.parent().next().removeClass("displayNone");
	});
	
	
	$("#Text input").on("keyup" , function() {
		var isValid = true;
		var $textField = $(this);
		var fieldMessage = "Between 5 and 10 characters";
		var minLength = 5;
		var maxLength = 10;
		if($textField.parent().hasClass("invalid")) {
			if(checkValidText($textField.val()) === null) {
				if($textField.val().length !== 0) {
					isValid = false;
					$textField.val().length < minLength && (fieldMessage = "Enter at least " + minLength + " characters");
					$textField.val().length > maxLength && (fieldMessage = "Enter no more than " + maxLength + " characters");
				}
			}

			if(isValid) {
				$textField.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);			
			} else {
				$textField.parent().addClass("invalid").next().addClass("error");
			}
		}
	});

/* 
	========== TEXT MANDATORY ========== 
*/
	
	$("#TextMandatory input").on("blur" , function() {
		var isValid = true;
		var $textField = $(this);
		var fieldMessage = "Between 5 and 10 characters";
		var minLength = 5;
		var maxLength = 10;
		if($textField.parent().attr("data-interacted") === "true") {
			if($textField.val().length < 1) {
				isValid = false;
				fieldMessage = "Enter a Process Code";
			} else {
				if(checkValidText($textField.val()) === null) {
					isValid = false;
					$textField.val().length < minLength && (fieldMessage = "Enter at least " + minLength + " characters");
					$textField.val().length > maxLength && (fieldMessage = "Enter no more than " + maxLength + " characters");
				}
			}
			
			if(isValid) {
				$textField.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);			
			} else {
				$textField.parent().addClass("invalid").next().addClass("error").text(fieldMessage);
			}
		}
	});
	
	$("#TextMandatory input").on("focus" , function() {
		var $textField = $(this);
		$textField.parent().next().removeClass("displayNone");
	});
	
	
	$("#TextMandatory input").on("keyup" , function() {
		var isValid = true;
		var $textField = $(this);
		var fieldMessage = "Between 5 and 10 characters";
		var minLength = 5;
		var maxLength = 10;
		if($textField.parent().attr("data-interacted") !== "true") {
			$textField.parent().attr("data-interacted" , "true");
		} else {
			if($textField.parent().hasClass("invalid")) {
				if($textField.val().length < 1) {
					isValid = false;
				} else {
					if(checkValidText($textField.val()) === null) {
						isValid = false;
					}
				}
	
				if(isValid) {
					$textField.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);			
				} else {
					$textField.parent().addClass("invalid").next().addClass("error");
				}
			}
		}
	});
	
/* 
	========== TEXT AREA ========== 
*/
	
	$("#TextArea textarea").on("blur" , function() {
		var isValid = true;
		var $textArea = $(this);
		var fieldMessage = "Up to 4000 characters";
		var charactersOver = 4000 - $textArea.val().length

		if(!checkValidTextArea($textArea.val())) {
			isValid = false;
			fieldMessage = (charactersOver * -1) + " characters over the 4000 character limit";
		}
		
		if(isValid) {
			$textArea.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);		
		} else {
			$textArea.parent().addClass("invalid").next().addClass("error").text(fieldMessage);
		}
	});
	
	
	$("#TextArea textarea").on("keyup" , function() {
		var isValid = true;
		var $textArea = $(this);
		var fieldMessage = "Up to 4000 characters";	
		var charactersOver = 4000 - $textArea.val().length
		if($textArea.parent().hasClass("invalid")) {
			if(!checkValidTextArea($textArea.val())) {
				isValid = false;
				fieldMessage = (charactersOver * -1) + " characters over the 4000 character limit";
			}
			
			if(isValid) {
				$textArea.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);		
			} else {
				$textArea.parent().addClass("invalid").next().addClass("error").text(fieldMessage);
			}
		}
	});

/* 
	========== TEXT AREA MANDATORY ========== 
*/
	
	$("#TextAreaMandatory textarea").on("blur" , function() {
		var isValid = true;
		var $textArea = $(this);
		var fieldMessage = "Up to 4000 characters";
		var charactersOver = 4000 - $textArea.val().length;
		if($textArea.parent().attr("data-interacted") === "true") {
			if(!checkValidTextArea($textArea.val())) {
				isValid = false;
				fieldMessage = (charactersOver * -1) + " characters over the 4000 character limit";
			} else if($textArea.val().length < 1) {
				isValid = false;
				fieldMessage = "Enter Comments";
			}
			
			if(isValid) {
				$textArea.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);		
			} else {
				$textArea.parent().addClass("invalid").next().addClass("error").text(fieldMessage);
			}
		}		
	});
	
	
	$("#TextAreaMandatory textarea").on("keyup" , function() {
		var isValid = true;
		var $textArea = $(this);
		var fieldMessage = "Up to 4000 characters";
		var charactersOver = 4000 - $textArea.val().length;
		if($textArea.parent().attr("data-interacted") !== "true") {
			$textArea.parent().attr("data-interacted" , "true");
		} else {
			if($textArea.parent().hasClass("invalid")) {
				if(!checkValidTextArea($textArea.val())) {
					isValid = false;
					fieldMessage = (charactersOver * -1) + " characters over the 4000 character limit";
				}
				
				if(isValid) {
					$textArea.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);		
				} else {
					$textArea.parent().addClass("invalid").next().addClass("error").text(fieldMessage);
				}
			}
		}
	});
	
/* 
	========== NUMBER ========== 
*/
	
	$("#Number input").on("blur" , function() {
		var isValid = true;
		var $textField = $(this);
		var fieldMessage = "Eg. 30";
		if(checkValidNumber($textField.val()) === null) {
			if($textField.val().length !== 0) {
				isValid = false;
				fieldMessage = "Enter a valid number of days: eg. 30";
			}
		}
		
		if(isValid) {
			$textField.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);	
		} else {
			$textField.parent().addClass("invalid").next().addClass("error").text(fieldMessage);
		}
	});
	
	
	$("#Number input").on("keyup" , function() {
		var isValid = true;
		var $textField = $(this);
		var fieldMessage = "Eg. 30";
		if($textField.parent().hasClass("invalid")) {
			if(checkValidNumber($textField.val()) === null) {
				isValid = false;
			}
			
			if(isValid) {
				$textField.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);	
			} else {
				$textField.parent().addClass("invalid").next().addClass("error");
			}
		}
	});

/* 
	========== NUMBER MANDATORY ========== 
*/
	
	$("#NumberMandatory input").on("blur" , function() {
		var isValid = true;
		var $textField = $(this);
		var fieldMessage = "Eg. 30";
		if($textField.parent().attr("data-interacted") === "true") {
			if($textField.val().length < 1) {
				isValid = false;
				fieldMessage = "Enter Days to Complete";
			} else {
				if(checkValidNumber($textField.val()) === null) {
					isValid = false;
					fieldMessage = "Enter a valid number of days: eg. 30";
				}
			}
			
			if(isValid) {
				$textField.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);	
			} else {
				$textField.parent().addClass("invalid").next().addClass("error").text(fieldMessage);
			}
		}
	});
	
	
	$("#NumberMandatory input").on("keyup" , function() {
		var isValid = true;
		var $textField = $(this);
		var fieldMessage = "Eg. 30";
		if($textField.parent().attr("data-interacted") !== "true") {
			$textField.parent().attr("data-interacted" , "true");
		} else {
			if($textField.parent().hasClass("invalid")) {
				if($textField.val().length < 1) {
					isValid = false;
				} else {
					if(checkValidNumber($textField.val()) === null) {
						isValid = false;
					}
				}
	
				if(isValid) {
					$textField.parent().removeClass("invalid").next().removeClass("error").text(fieldMessage);	
				} else {
					$textField.parent().addClass("invalid").next().addClass("error");
				}
			}
		}
	});
	
/* 
	========== SINGLE SELECT MANDATORY ========== 
*/
	
	$("#SingleSelectMandatory").on("change" , function() {
		var isValid = true;
		var $select = $(this);
		var fieldMessage = "";
		if($select.val() < 1) {
			isValid = false;
			fieldMessage = "Select a Zone";
		}
		
		if(isValid) {
			$select.removeClass("invalid").next().removeClass("error").html(fieldMessage);			
		} else {
			$select.addClass("invalid").next().addClass("error").html(fieldMessage);
		}
	});
	
});

function checkValidDate(date) {
	var match = date.match(/^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/);
	return match;
}

function checkValidText(text) {
	var match = text.match(/^([a-zA-Z0-9_-]){5,10}$/);
	return match;
}

function checkValidTextArea(text) {
	var match = text.length < 4000;
	return match;
}

function checkValidNumber(text) {
	var match = text.match(/^[+-]?((\d+(\.\d*)?)|(\.\d+))$/);
	return match;
}
