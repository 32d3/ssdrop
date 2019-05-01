function buildSecureMessage() {
  var secureMessage = "";
  $("#dropzone_form input[type=text]").each(function() {
    if (this.name.startsWith("secure_")) {
      secureMessage +=
        $("label[for='" + $(this).attr("id") + "']").text() +
        ": " +
        this.value +
        "\n";
    }
  });
  return secureMessage;
}

function isFormValid() {
  var isValid = true;
  if (!/(.+)@(.+){2,}\.(.+){2,}/.test($("#email").val())) {
    alert("You did not provide a valid email address");
    isValid = false;
    return isValid;
  }
  $("#dropzone_form input[type=text]").each(function() {
    if (isValid && this.value.trim() == "") {
      alert("You must complete all input fields");
      isValid = false;
      return isValid;
    }
  });
  if (isValid && widget.nbrOfFilesAttached < 1) {
    //alert("You did not attach a file");
    //isValid = false;
    return isValid;
  }
  return isValid;
}

function submitHostedDropzone(url) {
  var postData = {};
  postData["name"] = $("#name").val();
  postData["email"] = $("#email").val();
  postData["packageCode"] = widget.packageCode;
  postData["publicApiKey"] = dropzoneId;
  $.post(
    sendSafelyHost + "/auth/json/?action=submitHostedDropzone",
    postData,
    function(result) {
      if (result.integrationUrls !== undefined) {
        for (i = 0; i < result.integrationUrls.length; i++) {
          var integrationUrl = result.integrationUrls[i];
          //Third party form integration...do post to URL
          var postData = {};
          postData["digest"] = result.digest;
          postData["data"] = result.data;
          postData["secureLink"] = url;
          $.post(
            integrationUrl,
            postData,
            function(json) {
              if (json.error != undefined) {
                alert(json.error);
                $("#spinner").hide();
              } else {
                //success
                $("#dropzone_form").hide();
                $("#submit_done").show();
              }
            },
            "json"
          );
        }
      }
    }
  );
}

function submitForm() {
  if (isFormValid()) {
    $("#spinner").show();
    var secureMessage = buildSecureMessage();
    widget.setUnconfirmedSender(
      $("#email")
        .val()
        .toLowerCase()
    );
    widget.addMessage(secureMessage);
    widget.finalizePackage(
      function(url) {
        var threadRegex = new RegExp("thread=[A-Za-z0-9-]+");
        var threadId = threadRegex
          .exec(url)
          .toString()
          .substr(7);
        $("#dropzone-thread-id").text(threadId);
        submitHostedDropzone(url);
      },
      function() {
        $("#spinner").hide();
      }
    );
  }
}

var widget;
var sendSafelyHost = "https://wework.sendsafely.com";
var dropzoneId = "fgaIvT13r7TnIMQzfLmV78cCxjoBdJoea4XLk1aMLNQ";
$(document).ready(function() {
  var placeholderElement = $("#dropzone-placeholder-div");
  var formField = $("#sendsafely-link");
  widget = new SendSafelyDropzone(dropzoneId, placeholderElement, formField);
  widget.url = sendSafelyHost;
  widget.initialize();
});
