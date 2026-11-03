function doGet(e) {
  var callback = String(e.parameter.callback || "");
  if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput("Invalid callback");
  }

  function jsonp(payload) {
    return ContentService.createTextOutput(
      callback + "(" + JSON.stringify(payload) + ");",
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  if (e.parameter.action !== "mf") {
    return jsonp({ error: "Unknown action." });
  }

  var id = String(e.parameter.id || "");
  if (!/^\d+$/.test(id)) {
    return jsonp({ error: "Invalid scheme code." });
  }

  try {
    var response = UrlFetchApp.fetch("https://api.mfapi.in/mf/" + id, {
      muteHttpExceptions: true,
    });
    var payload = JSON.parse(response.getContentText());
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      return jsonp({ error: "MF API returned an error." });
    }
    return jsonp(payload);
  } catch (error) {
    return jsonp({ error: String(error) });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    var date = data.date;
    var id = data.id;
    var units = data.units;
    var price = data.price || 0;
    var stamp = 0;
    var name = "";

    sheet.appendRow([date, id, units, price, stamp, name]);

    return ContentService.createTextOutput("Success").setMimeType(
      ContentService.MimeType.TEXT,
    );
  } catch (error) {
    return ContentService.createTextOutput(
      "Error: " + error.toString(),
    ).setMimeType(ContentService.MimeType.TEXT);
  }
}
